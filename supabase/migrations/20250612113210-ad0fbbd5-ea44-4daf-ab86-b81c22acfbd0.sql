
-- Atualizar o relatório da Nathalia para a data 10/06/2025
UPDATE daily_reports 
SET reunioes_agendadas = 5, 
    reunioes_realizadas = 2,
    updated_at = now()
WHERE vendedor = 'Nathalia' 
AND data_registro = '2025-06-10';
