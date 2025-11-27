-- Add new configuration columns to projects table
ALTER TABLE projects 
ADD COLUMN voice_type text DEFAULT 'alloy',
ADD COLUMN voice_tone text DEFAULT 'neutral',
ADD COLUMN video_type text DEFAULT 'real',
ADD COLUMN has_subtitles boolean DEFAULT true;