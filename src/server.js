require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { PrismaClient } = require("@prisma/client");
const swaggerDocument = require("./swagger.json");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Documentação Swagger interativa
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 1. GET /api/projects (Filtro por tecnologia e paginação)
app.get("/api/projects", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const technology = req.query.technology;
    const skip = (page - 1) * limit;

    const where = technology
      ? { technology: { contains: technology, mode: "insensitive" } }
      : {};

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects (Criar projeto auxiliar)
app.post("/api/projects", async (req, res, next) => {
  try {
    const { title, description, technology } = req.body;
    if (!title || !description || !technology) {
      const err = new Error("Campos title, description e technology são obrigatórios.");
      err.statusCode = 400;
      throw err;
    }
    const project = await prisma.project.create({
      data: { title, description, technology },
    });
    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// 2. PUT /api/projects/:id/upvote (Incremento de curtidas)
app.put("/api/projects/:id/upvote", async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      const err = new Error("O ID informado deve ser um número válido.");
      err.statusCode = 400;
      throw err;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      const err = new Error(`Projeto com ID ${projectId} não encontrado.`);
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { upvotes: { increment: 1 } },
    });

    return res.status(200).json({
      message: "Upvote registrado com sucesso!",
      id: updated.id,
      upvotes: updated.upvotes,
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/projects/:id/feedbacks (Nota de 1 a 5 e cálculo da média)
app.post("/api/projects/:id/feedbacks", async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);
    const { rating, comment } = req.body;

    if (isNaN(projectId)) {
      const err = new Error("O ID informado deve ser um número válido.");
      err.statusCode = 400;
      throw err;
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      const err = new Error("A nota (rating) deve ser um número entre 1 e 5.");
      err.statusCode = 400;
      throw err;
    }

    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      const err = new Error("O comentário é obrigatório.");
      err.statusCode = 400;
      throw err;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      const err = new Error(`Projeto com ID ${projectId} não encontrado.`);
      err.statusCode = 404;
      throw err;
    }

    const feedback = await prisma.feedback.create({
      data: { rating, comment: comment.trim(), projectId },
    });

    const feedbacks = await prisma.feedback.findMany({ where: { projectId } });
    const soma = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const media = parseFloat((soma / feedbacks.length).toFixed(2));

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { averageRating: media },
    });

    return res.status(201).json({
      message: "Feedback adicionado!",
      feedback,
      averageRating: updatedProject.averageRating,
    });
  } catch (error) {
    next(error);
  }
});

// Manipulador global de erros
app.use(errorHandler);

// Inicialização com bind explícito em 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger ativa em /api/docs`);
});