import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Validações (DTOs com Zod)
const createProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  bio: z.string().optional()
});

const createTechnologySchema = z.object({
  name: z.string().min(1, "O nome da tecnologia é obrigatório")
});

const createProjectSchema = z.object({
  title: z.string().min(2, "O título do projeto é obrigatório"),
  description: z.string().min(5, "A descrição deve ter ao menos 5 caracteres"),
  repositoryUrl: z.string().url("A URL do repositório deve ser válida"),
  profileId: z.string().uuid("ID do perfil inválido"),
  technologyIds: z.array(z.string().uuid()).optional()
});

// Endpoints Profiles
app.post('/api/profiles', async (req: Request, res: Response): Promise<any> => {
  try {
    const data = createProfileSchema.parse(req.body);
    const profile = await prisma.profile.create({ data });
    return res.status(201).json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message });
  }
});

app.get('/api/profiles/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { projects: true }
    });
    if (!profile) return res.status(404).json({ message: "Perfil não encontrado" });
    return res.json(profile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoints Technologies
app.post('/api/technologies', async (req: Request, res: Response): Promise<any> => {
  try {
    const data = createTechnologySchema.parse(req.body);
    const tech = await prisma.technology.create({ data });
    return res.status(201).json(tech);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message });
  }
});

app.get('/api/technologies', async (_req: Request, res: Response): Promise<any> => {
  try {
    const technologies = await prisma.technology.findMany();
    return res.json(technologies);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoints Projects
app.post('/api/projects', async (req: Request, res: Response): Promise<any> => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        repositoryUrl: data.repositoryUrl,
        profileId: data.profileId,
        technologies: data.technologyIds ? {
          connect: data.technologyIds.map((id) => ({ id }))
        } : undefined
      },
      include: { technologies: true, profile: true }
    });
    return res.status(201).json(project);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message });
  }
});

app.get('/api/projects', async (_req: Request, res: Response): Promise<any> => {
  try {
    const projects = await prisma.project.findMany({
      include: { profile: true, technologies: true, feedbacks: true }
    });
    return res.json(projects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
