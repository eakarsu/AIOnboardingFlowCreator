const pool = require('../config/database');
const PDFDocument = require('pdfkit');

const tableColumnsMap = {
  'onboarding_flows': ['id', 'name', 'description', 'status', 'target_audience', 'total_steps', 'completion_rate', 'created_at'],
  'flow_steps': ['id', 'flow_id', 'title', 'content', 'step_type', 'step_order', 'position', 'created_at'],
  'user_segments': ['id', 'name', 'description', 'user_count', 'status', 'created_at'],
  'templates': ['id', 'name', 'description', 'category', 'is_premium', 'usage_count', 'rating', 'created_at'],
  'ai_content': ['id', 'title', 'content_type', 'model_used', 'tokens_used', 'status', 'created_at'],
  'analytics': ['id', 'flow_id', 'metric_name', 'metric_value', 'dimension', 'dimension_value', 'date'],
  'integrations': ['id', 'name', 'provider', 'description', 'status', 'created_at'],
  'tooltips': ['id', 'title', 'content', 'element_selector', 'position', 'trigger_type', 'is_active', 'created_at'],
  'checklists': ['id', 'name', 'description', 'display_position', 'is_dismissible', 'created_at'],
  'progress_tracking': ['id', 'user_id', 'flow_id', 'current_step', 'total_steps', 'percentage_complete', 'started_at'],
  'ab_tests': ['id', 'name', 'description', 'traffic_split', 'status', 'winner', 'start_date', 'end_date'],
  'triggers': ['id', 'name', 'description', 'event_type', 'is_active', 'fire_count', 'created_at'],
  'personalization_rules': ['id', 'name', 'description', 'rule_type', 'priority', 'is_active', 'created_at'],
  'notifications': ['id', 'title', 'message', 'notification_type', 'channel', 'status', 'sent_count', 'created_at'],
  'pto_requests': ['id', 'employee_name', 'department', 'request_type', 'start_date', 'end_date', 'days_requested', 'status'],
  'mentor_matches': ['id', 'mentee_name', 'mentor_name', 'department', 'matching_score', 'status', 'session_count', 'created_at'],
  'feedback': ['id', 'user_name', 'feedback_type', 'category', 'subject', 'sentiment', 'priority', 'status', 'created_at'],
  'training_recommendations': ['id', 'user_name', '"current_role"', '"target_role"', 'priority', 'estimated_duration', 'completion_percentage', 'status'],
  'ai_checklists': ['id', 'name', 'user_name', 'checklist_type', 'total_items', 'completed_items', 'completion_percentage', 'priority', 'status'],
  'ai_progress': ['id', 'user_name', 'goal_type', 'current_value', 'target_value', 'progress_percentage', 'trend', 'status']
};

const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const createExportController = (tableName) => {
  const columns = tableColumnsMap[tableName] || ['id'];

  return {
    exportCSV: async (req, res) => {
      try {
        const selectCols = columns.join(', ');
        const result = await pool.query(`SELECT ${selectCols} FROM ${tableName} ORDER BY id`);

        const headerRow = columns.map(c => c.replace(/"/g, '')).join(',');
        const dataRows = result.rows.map(row =>
          columns.map(col => {
            const key = col.replace(/"/g, '');
            return escapeCsvValue(row[key]);
          }).join(',')
        );

        const csv = [headerRow, ...dataRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${tableName}_export.csv"`);
        res.send(csv);
      } catch (error) {
        console.error(`CSV export error for ${tableName}:`, error);
        res.status(500).json({ error: 'Export failed' });
      }
    },

    exportPDF: async (req, res) => {
      try {
        const selectCols = columns.join(', ');
        const result = await pool.query(`SELECT ${selectCols} FROM ${tableName} ORDER BY id`);

        const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 30 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${tableName}_export.pdf"`);
        doc.pipe(res);

        // Title
        doc.fontSize(18).font('Helvetica-Bold').text(tableName.replace(/_/g, ' ').toUpperCase(), { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Exported: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();

        // Table
        const cleanCols = columns.map(c => c.replace(/"/g, ''));
        const pageWidth = doc.page.width - 60;
        const colWidth = Math.min(pageWidth / cleanCols.length, 120);
        let y = doc.y;

        // Header
        doc.font('Helvetica-Bold').fontSize(8);
        cleanCols.forEach((col, i) => {
          doc.text(col, 30 + i * colWidth, y, { width: colWidth - 4, lineBreak: false });
        });
        y += 15;
        doc.moveTo(30, y).lineTo(30 + cleanCols.length * colWidth, y).stroke();
        y += 5;

        // Rows
        doc.font('Helvetica').fontSize(7);
        for (const row of result.rows) {
          if (y > doc.page.height - 50) {
            doc.addPage({ layout: 'landscape', size: 'A4', margin: 30 });
            y = 30;
          }
          cleanCols.forEach((col, i) => {
            const val = row[col] === null ? '' : String(row[col]).substring(0, 30);
            doc.text(val, 30 + i * colWidth, y, { width: colWidth - 4, lineBreak: false });
          });
          y += 14;
        }

        doc.end();
      } catch (error) {
        console.error(`PDF export error for ${tableName}:`, error);
        res.status(500).json({ error: 'Export failed' });
      }
    }
  };
};

module.exports = { createExportController };
