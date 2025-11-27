-- Add language column to projects table
ALTER TABLE projects 
ADD COLUMN language text DEFAULT 'fr';