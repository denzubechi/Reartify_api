import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany();

    // Explicitly typing res
    const response = res as Response; // Force it to be of type `Response`

    response.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    const response = res as Response;
    response.status(500).json({ message: "Internal server error." });
  }
};
