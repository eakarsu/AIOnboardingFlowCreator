const pool = require('../config/database');

// Generic CRUD operations factory with pagination, search, filter, sort
const createCrudController = (tableName, options = {}) => {
  const {
    searchableColumns = [],
    filterableColumns = [],
    quotedColumns = [],
    defaultSort = 'created_at',
    idField = 'id'
  } = options;

  const quoteCol = (col) => quotedColumns.includes(col) ? `"${col}"` : col;

  return {
    getAll: async (req, res) => {
      try {
        const { page, limit = 10, search, sort, order = 'desc', ...filters } = req.query;

        let query = `SELECT * FROM ${tableName}`;
        let countQuery = `SELECT COUNT(*)::int as total FROM ${tableName}`;
        const params = [];
        const conditions = [];

        // Search
        if (search && searchableColumns.length > 0) {
          const searchConditions = searchableColumns.map((col, i) => {
            params.push(`%${search}%`);
            return `${quoteCol(col)}::text ILIKE $${params.length}`;
          });
          conditions.push(`(${searchConditions.join(' OR ')})`);
        }

        // Filters
        for (const [key, value] of Object.entries(filters)) {
          if (filterableColumns.includes(key) && value) {
            params.push(value);
            conditions.push(`${quoteCol(key)} = $${params.length}`);
          }
        }

        if (conditions.length > 0) {
          const whereClause = ` WHERE ${conditions.join(' AND ')}`;
          query += whereClause;
          countQuery += whereClause;
        }

        // Sort
        const sortCol = sort && [...searchableColumns, ...filterableColumns, 'id', 'created_at', 'updated_at'].includes(sort)
          ? quoteCol(sort)
          : quoteCol(defaultSort);
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortCol} ${sortOrder}`;

        // Pagination - only if page param is provided
        if (page) {
          const pageNum = Math.max(1, parseInt(page));
          const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
          const offset = (pageNum - 1) * limitNum;

          // Count with same params for search/filter
          const countResult = await pool.query(countQuery, params);
          const total = countResult.rows[0].total;

          params.push(limitNum);
          query += ` LIMIT $${params.length}`;
          params.push(offset);
          query += ` OFFSET $${params.length}`;

          const result = await pool.query(query, params);
          return res.json({
            data: result.rows,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total,
              totalPages: Math.ceil(total / limitNum)
            }
          });
        }

        // No pagination - return flat array (backward compatible)
        const result = await pool.query(query, params);
        res.json(result.rows);
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },

    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query(`SELECT * FROM ${tableName} WHERE ${idField} = $1`, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Not found' });
        }

        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Error fetching ${tableName} by id:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },

    delete: async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM ${tableName} WHERE ${idField} = $1 RETURNING *`, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Not found' });
        }

        res.json({ message: 'Deleted successfully', data: result.rows[0] });
      } catch (error) {
        console.error(`Error deleting ${tableName}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },

    bulkDelete: async (req, res) => {
      try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: 'ids array is required' });
        }
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const result = await pool.query(
          `DELETE FROM ${tableName} WHERE ${idField} IN (${placeholders}) RETURNING *`,
          ids
        );
        res.json({ message: `Deleted ${result.rowCount} items`, deleted: result.rowCount });
      } catch (error) {
        console.error(`Error bulk deleting ${tableName}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },

    bulkUpdate: async (req, res) => {
      try {
        const { ids, data } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0 || !data) {
          return res.status(400).json({ error: 'ids array and data object are required' });
        }

        const setClauses = [];
        const params = [];
        for (const [key, value] of Object.entries(data)) {
          params.push(value);
          setClauses.push(`${quoteCol(key)} = $${params.length}`);
        }

        if (setClauses.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(...ids);
        const placeholders = ids.map((_, i) => `$${params.length - ids.length + i + 1}`).join(',');

        const result = await pool.query(
          `UPDATE ${tableName} SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
           WHERE ${idField} IN (${placeholders}) RETURNING *`,
          params
        );

        res.json({ message: `Updated ${result.rowCount} items`, updated: result.rowCount, data: result.rows });
      } catch (error) {
        console.error(`Error bulk updating ${tableName}:`, error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
};

// Onboarding Flows Controller
const flowsController = {
  ...createCrudController('onboarding_flows', {
    searchableColumns: ['name', 'description', 'target_audience'],
    filterableColumns: ['status'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, status, target_audience, trigger_event, total_steps } = req.body;
      const result = await pool.query(
        `INSERT INTO onboarding_flows (name, description, status, target_audience, trigger_event, total_steps, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, description, status || 'draft', target_audience, trigger_event, total_steps || 0, req.user?.id || 1]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating flow:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, status, target_audience, trigger_event, total_steps, completion_rate } = req.body;
      const result = await pool.query(
        `UPDATE onboarding_flows SET name = $1, description = $2, status = $3, target_audience = $4,
         trigger_event = $5, total_steps = $6, completion_rate = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [name, description, status, target_audience, trigger_event, total_steps, completion_rate, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Flow not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating flow:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Flow Steps Controller
const stepsController = {
  ...createCrudController('flow_steps', {
    searchableColumns: ['title', 'content'],
    filterableColumns: ['step_type', 'flow_id'],
    defaultSort: 'step_order'
  }),

  getByFlowId: async (req, res) => {
    try {
      const { flowId } = req.params;
      const result = await pool.query(
        'SELECT * FROM flow_steps WHERE flow_id = $1 ORDER BY step_order',
        [flowId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching steps:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  create: async (req, res) => {
    try {
      const { flow_id, title, content, step_type, step_order, element_selector, position, action_type, action_config, is_required, delay_seconds } = req.body;
      const result = await pool.query(
        `INSERT INTO flow_steps (flow_id, title, content, step_type, step_order, element_selector, position, action_type, action_config, is_required, delay_seconds)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [flow_id, title, content, step_type, step_order, element_selector, position, action_type, action_config ? JSON.stringify(action_config) : null, is_required !== false, delay_seconds || 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, step_type, step_order, element_selector, position, action_type, action_config, is_required, delay_seconds } = req.body;
      const result = await pool.query(
        `UPDATE flow_steps SET title = $1, content = $2, step_type = $3, step_order = $4, element_selector = $5,
         position = $6, action_type = $7, action_config = $8, is_required = $9, delay_seconds = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 RETURNING *`,
        [title, content, step_type, step_order, element_selector, position, action_type, action_config ? JSON.stringify(action_config) : null, is_required, delay_seconds, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Step not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// User Segments Controller
const segmentsController = {
  ...createCrudController('user_segments', {
    searchableColumns: ['name', 'description'],
    filterableColumns: ['status'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, criteria, user_count, status } = req.body;
      const result = await pool.query(
        `INSERT INTO user_segments (name, description, criteria, user_count, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, description, criteria ? JSON.stringify(criteria) : '{}', user_count || 0, status || 'active', req.user?.id || 1]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating segment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, criteria, user_count, status } = req.body;
      const result = await pool.query(
        `UPDATE user_segments SET name = $1, description = $2, criteria = $3, user_count = $4, status = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [name, description, criteria ? JSON.stringify(criteria) : '{}', user_count, status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Segment not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating segment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Templates Controller
const templatesController = {
  ...createCrudController('templates', {
    searchableColumns: ['name', 'description', 'category'],
    filterableColumns: ['category', 'is_premium'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, category, thumbnail, content, is_premium } = req.body;
      const result = await pool.query(
        `INSERT INTO templates (name, description, category, thumbnail, content, is_premium)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, description, category, thumbnail, content ? JSON.stringify(content) : '{}', is_premium || false]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, thumbnail, content, is_premium } = req.body;
      const result = await pool.query(
        `UPDATE templates SET name = $1, description = $2, category = $3, thumbnail = $4, content = $5, is_premium = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 RETURNING *`,
        [name, description, category, thumbnail, content ? JSON.stringify(content) : '{}', is_premium, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// AI Content Controller
const aiContentController = {
  ...createCrudController('ai_content', {
    searchableColumns: ['title', 'content_type', 'generated_content'],
    filterableColumns: ['content_type', 'status'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { title, content_type, prompt, generated_content, model_used, tokens_used, flow_id } = req.body;
      const result = await pool.query(
        `INSERT INTO ai_content (title, content_type, prompt, generated_content, model_used, tokens_used, flow_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [title, content_type, prompt, generated_content, model_used, tokens_used || 0, flow_id, req.user?.id || 1]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating AI content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Analytics Controller
const analyticsController = {
  ...createCrudController('analytics', {
    searchableColumns: ['metric_name', 'dimension', 'dimension_value'],
    filterableColumns: ['metric_name', 'flow_id'],
    defaultSort: 'date'
  }),

  getByFlowId: async (req, res) => {
    try {
      const { flowId } = req.params;
      const result = await pool.query(
        'SELECT * FROM analytics WHERE flow_id = $1 ORDER BY date DESC',
        [flowId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  create: async (req, res) => {
    try {
      const { flow_id, metric_name, metric_value, dimension, dimension_value } = req.body;
      const result = await pool.query(
        `INSERT INTO analytics (flow_id, metric_name, metric_value, dimension, dimension_value)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [flow_id, metric_name, metric_value, dimension, dimension_value]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Integrations Controller
const integrationsController = {
  ...createCrudController('integrations', {
    searchableColumns: ['name', 'provider', 'description'],
    filterableColumns: ['status', 'provider'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, provider, description, icon, status, config } = req.body;
      const result = await pool.query(
        `INSERT INTO integrations (name, provider, description, icon, status, config)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, provider, description, icon, status || 'inactive', config ? JSON.stringify(config) : '{}']
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating integration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, provider, description, icon, status, config } = req.body;
      const result = await pool.query(
        `UPDATE integrations SET name = $1, provider = $2, description = $3, icon = $4, status = $5, config = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 RETURNING *`,
        [name, provider, description, icon, status, config ? JSON.stringify(config) : '{}', id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Integration not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating integration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Tooltips Controller
const tooltipsController = {
  ...createCrudController('tooltips', {
    searchableColumns: ['title', 'content'],
    filterableColumns: ['position', 'trigger_type', 'is_active'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { title, content, element_selector, position, trigger_type, style_config, flow_id, is_active } = req.body;
      const result = await pool.query(
        `INSERT INTO tooltips (title, content, element_selector, position, trigger_type, style_config, flow_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [title, content, element_selector, position || 'top', trigger_type || 'hover', style_config ? JSON.stringify(style_config) : '{}', flow_id, is_active !== false]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating tooltip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, element_selector, position, trigger_type, style_config, flow_id, is_active } = req.body;
      const result = await pool.query(
        `UPDATE tooltips SET title = $1, content = $2, element_selector = $3, position = $4, trigger_type = $5,
         style_config = $6, flow_id = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9 RETURNING *`,
        [title, content, element_selector, position, trigger_type, style_config ? JSON.stringify(style_config) : '{}', flow_id, is_active, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tooltip not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating tooltip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Checklists Controller
const checklistsController = {
  ...createCrudController('checklists', {
    searchableColumns: ['name', 'description'],
    filterableColumns: ['display_position'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, items, flow_id, completion_action, display_position, is_dismissible } = req.body;
      const result = await pool.query(
        `INSERT INTO checklists (name, description, items, flow_id, completion_action, display_position, is_dismissible)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, description, items ? JSON.stringify(items) : '[]', flow_id, completion_action, display_position || 'bottom-right', is_dismissible !== false]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating checklist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, items, flow_id, completion_action, display_position, is_dismissible } = req.body;
      const result = await pool.query(
        `UPDATE checklists SET name = $1, description = $2, items = $3, flow_id = $4, completion_action = $5,
         display_position = $6, is_dismissible = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [name, description, items ? JSON.stringify(items) : '[]', flow_id, completion_action, display_position, is_dismissible, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Checklist not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating checklist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Progress Tracking Controller
const progressController = {
  ...createCrudController('progress_tracking', {
    searchableColumns: [],
    filterableColumns: ['user_id', 'flow_id'],
    defaultSort: 'last_activity'
  }),

  getByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await pool.query(
        `SELECT pt.*, of.name as flow_name FROM progress_tracking pt
         LEFT JOIN onboarding_flows of ON pt.flow_id = of.id
         WHERE pt.user_id = $1 ORDER BY pt.last_activity DESC`,
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  create: async (req, res) => {
    try {
      const { user_id, flow_id, current_step, total_steps, percentage_complete } = req.body;
      const result = await pool.query(
        `INSERT INTO progress_tracking (user_id, flow_id, current_step, total_steps, percentage_complete)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, flow_id, current_step || 0, total_steps || 0, percentage_complete || 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { current_step, percentage_complete } = req.body;
      const result = await pool.query(
        `UPDATE progress_tracking SET current_step = $1, percentage_complete = $2, last_activity = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [current_step, percentage_complete, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Progress not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// A/B Tests Controller
const abTestsController = {
  ...createCrudController('ab_tests', {
    searchableColumns: ['name', 'description'],
    filterableColumns: ['status', 'winner'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, flow_id, variant_a_config, variant_b_config, traffic_split, status, start_date, end_date } = req.body;
      const result = await pool.query(
        `INSERT INTO ab_tests (name, description, flow_id, variant_a_config, variant_b_config, traffic_split, status, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [name, description, flow_id, variant_a_config ? JSON.stringify(variant_a_config) : '{}', variant_b_config ? JSON.stringify(variant_b_config) : '{}', traffic_split || 50, status || 'draft', start_date || null, end_date || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating A/B test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, variant_a_config, variant_b_config, traffic_split, status, winner, start_date, end_date } = req.body;
      const result = await pool.query(
        `UPDATE ab_tests SET name = $1, description = $2, variant_a_config = $3, variant_b_config = $4,
         traffic_split = $5, status = $6, winner = $7, start_date = $8, end_date = $9
         WHERE id = $10 RETURNING *`,
        [name, description, variant_a_config ? JSON.stringify(variant_a_config) : '{}', variant_b_config ? JSON.stringify(variant_b_config) : '{}', traffic_split, status, winner, start_date || null, end_date || null, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'A/B test not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating A/B test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Triggers Controller
const triggersController = {
  ...createCrudController('triggers', {
    searchableColumns: ['name', 'description', 'event_type'],
    filterableColumns: ['event_type', 'is_active'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, event_type, conditions, actions, flow_id, is_active } = req.body;
      const result = await pool.query(
        `INSERT INTO triggers (name, description, event_type, conditions, actions, flow_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, description, event_type, conditions ? JSON.stringify(conditions) : '{}', actions ? JSON.stringify(actions) : '{}', flow_id, is_active !== false]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating trigger:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, event_type, conditions, actions, flow_id, is_active } = req.body;
      const result = await pool.query(
        `UPDATE triggers SET name = $1, description = $2, event_type = $3, conditions = $4, actions = $5,
         flow_id = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [name, description, event_type, conditions ? JSON.stringify(conditions) : '{}', actions ? JSON.stringify(actions) : '{}', flow_id, is_active, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Trigger not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating trigger:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Personalization Rules Controller
const personalizationController = {
  ...createCrudController('personalization_rules', {
    searchableColumns: ['name', 'description', 'rule_type'],
    filterableColumns: ['rule_type', 'is_active'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, rule_type, conditions, content_variations, priority, segment_id, is_active } = req.body;
      const result = await pool.query(
        `INSERT INTO personalization_rules (name, description, rule_type, conditions, content_variations, priority, segment_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, description, rule_type, conditions ? JSON.stringify(conditions) : '{}', content_variations ? JSON.stringify(content_variations) : '{}', priority || 0, segment_id, is_active !== false]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating personalization rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, rule_type, conditions, content_variations, priority, segment_id, is_active } = req.body;
      const result = await pool.query(
        `UPDATE personalization_rules SET name = $1, description = $2, rule_type = $3, conditions = $4,
         content_variations = $5, priority = $6, segment_id = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9 RETURNING *`,
        [name, description, rule_type, conditions ? JSON.stringify(conditions) : '{}', content_variations ? JSON.stringify(content_variations) : '{}', priority, segment_id, is_active, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Personalization rule not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating personalization rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Notifications Controller
const notificationsController = {
  ...createCrudController('notifications', {
    searchableColumns: ['title', 'message'],
    filterableColumns: ['notification_type', 'channel', 'status'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { title, message, notification_type, channel, target_segment_id, schedule_time, status } = req.body;
      const result = await pool.query(
        `INSERT INTO notifications (title, message, notification_type, channel, target_segment_id, schedule_time, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, message, notification_type, channel || 'in-app', target_segment_id, schedule_time || null, status || 'draft']
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, message, notification_type, channel, target_segment_id, schedule_time, status } = req.body;
      const result = await pool.query(
        `UPDATE notifications SET title = $1, message = $2, notification_type = $3, channel = $4,
         target_segment_id = $5, schedule_time = $6, status = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [title, message, notification_type, channel, target_segment_id, schedule_time || null, status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// ============ AI FEATURE CONTROLLERS ============

// PTO Requests Controller
const ptoRequestsController = {
  ...createCrudController('pto_requests', {
    searchableColumns: ['employee_name', 'department', 'reason'],
    filterableColumns: ['status', 'request_type', 'department'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { employee_id, employee_name, department, request_type, start_date, end_date, days_requested, reason, status, ai_recommendation, ai_approval_score } = req.body;
      const result = await pool.query(
        `INSERT INTO pto_requests (employee_id, employee_name, department, request_type, start_date, end_date, days_requested, reason, status, ai_recommendation, ai_approval_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [employee_id, employee_name, department, request_type, start_date || null, end_date || null, days_requested, reason, status || 'pending', ai_recommendation, ai_approval_score]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating PTO request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { employee_name, department, request_type, start_date, end_date, days_requested, reason, status, ai_recommendation, ai_approval_score, notes } = req.body;
      const result = await pool.query(
        `UPDATE pto_requests SET employee_name = $1, department = $2, request_type = $3, start_date = $4, end_date = $5,
         days_requested = $6, reason = $7, status = $8, ai_recommendation = $9, ai_approval_score = $10, notes = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $12 RETURNING *`,
        [employee_name, department, request_type, start_date || null, end_date || null, days_requested, reason, status, ai_recommendation, ai_approval_score, notes, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'PTO request not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating PTO request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Mentor Matches Controller
const mentorMatchesController = {
  ...createCrudController('mentor_matches', {
    searchableColumns: ['mentee_name', 'mentor_name', 'department'],
    filterableColumns: ['status', 'department'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { mentee_id, mentee_name, mentor_id, mentor_name, department, skills_to_develop, matching_score, match_reason, ai_recommendation, status } = req.body;
      const result = await pool.query(
        `INSERT INTO mentor_matches (mentee_id, mentee_name, mentor_id, mentor_name, department, skills_to_develop, matching_score, match_reason, ai_recommendation, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [mentee_id, mentee_name, mentor_id, mentor_name, department, skills_to_develop ? JSON.stringify(skills_to_develop) : '[]', matching_score, match_reason, ai_recommendation, status || 'pending']
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating mentor match:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { mentor_id, mentor_name, skills_to_develop, matching_score, match_reason, ai_recommendation, status, session_count, feedback_score, notes } = req.body;
      const result = await pool.query(
        `UPDATE mentor_matches SET mentor_id = $1, mentor_name = $2, skills_to_develop = $3, matching_score = $4, match_reason = $5,
         ai_recommendation = $6, status = $7, session_count = $8, feedback_score = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 RETURNING *`,
        [mentor_id, mentor_name, skills_to_develop ? JSON.stringify(skills_to_develop) : '[]', matching_score, match_reason, ai_recommendation, status, session_count, feedback_score, notes, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mentor match not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating mentor match:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Feedback Controller
const feedbackController = {
  ...createCrudController('feedback', {
    searchableColumns: ['user_name', 'subject', 'content', 'category'],
    filterableColumns: ['feedback_type', 'category', 'sentiment', 'priority', 'status'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { user_id, user_name, feedback_type, category, subject, content, sentiment, sentiment_score, ai_analysis, ai_action_items, priority, status } = req.body;
      const result = await pool.query(
        `INSERT INTO feedback (user_id, user_name, feedback_type, category, subject, content, sentiment, sentiment_score, ai_analysis, ai_action_items, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [user_id, user_name, feedback_type, category, subject, content, sentiment, sentiment_score, ai_analysis, ai_action_items ? JSON.stringify(ai_action_items) : '[]', priority || 'medium', status || 'new']
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback_type, category, subject, content, sentiment, sentiment_score, ai_analysis, ai_action_items, priority, status, response } = req.body;
      const result = await pool.query(
        `UPDATE feedback SET feedback_type = $1, category = $2, subject = $3, content = $4, sentiment = $5,
         sentiment_score = $6, ai_analysis = $7, ai_action_items = $8, priority = $9, status = $10, response = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $12 RETURNING *`,
        [feedback_type, category, subject, content, sentiment, sentiment_score, ai_analysis, ai_action_items ? JSON.stringify(ai_action_items) : '[]', priority, status, response, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Training Recommendations Controller
const trainingRecommendationsController = {
  ...createCrudController('training_recommendations', {
    searchableColumns: ['user_name', 'current_role', 'target_role'],
    filterableColumns: ['priority', 'status'],
    quotedColumns: ['current_role', 'target_role'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { user_id, user_name, current_role, target_role, skill_gap, recommended_courses, ai_learning_path, priority, estimated_duration, status } = req.body;
      const result = await pool.query(
        `INSERT INTO training_recommendations (user_id, user_name, "current_role", "target_role", skill_gap, recommended_courses, ai_learning_path, priority, estimated_duration, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [user_id, user_name, current_role, target_role, skill_gap ? JSON.stringify(skill_gap) : '[]', recommended_courses ? JSON.stringify(recommended_courses) : '[]', ai_learning_path, priority || 'medium', estimated_duration, status || 'pending']
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating training recommendation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { target_role, skill_gap, recommended_courses, ai_learning_path, priority, estimated_duration, completion_percentage, status, notes } = req.body;
      const result = await pool.query(
        `UPDATE training_recommendations SET "target_role" = $1, skill_gap = $2, recommended_courses = $3, ai_learning_path = $4,
         priority = $5, estimated_duration = $6, completion_percentage = $7, status = $8, notes = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10 RETURNING *`,
        [target_role, skill_gap ? JSON.stringify(skill_gap) : '[]', recommended_courses ? JSON.stringify(recommended_courses) : '[]', ai_learning_path, priority, estimated_duration, completion_percentage, status, notes, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Training recommendation not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating training recommendation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// AI Checklists Controller
const aiChecklistsController = {
  ...createCrudController('ai_checklists', {
    searchableColumns: ['name', 'description', 'user_name'],
    filterableColumns: ['checklist_type', 'priority', 'status'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { name, description, user_id, user_name, checklist_type, items, ai_suggestions, total_items, completed_items, due_date, priority, status } = req.body;
      const completion_percentage = total_items > 0 ? (completed_items / total_items) * 100 : 0;
      const result = await pool.query(
        `INSERT INTO ai_checklists (name, description, user_id, user_name, checklist_type, items, ai_suggestions, total_items, completed_items, completion_percentage, due_date, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [name, description, user_id, user_name, checklist_type, items ? JSON.stringify(items) : '[]', ai_suggestions, total_items || 0, completed_items || 0, completion_percentage, due_date || null, priority || 'medium', status || 'active']
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating AI checklist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, checklist_type, items, ai_suggestions, total_items, completed_items, due_date, priority, status } = req.body;
      const completion_percentage = total_items > 0 ? (completed_items / total_items) * 100 : 0;
      const result = await pool.query(
        `UPDATE ai_checklists SET name = $1, description = $2, checklist_type = $3, items = $4, ai_suggestions = $5,
         total_items = $6, completed_items = $7, completion_percentage = $8, due_date = $9, priority = $10, status = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $12 RETURNING *`,
        [name, description, checklist_type, items ? JSON.stringify(items) : '[]', ai_suggestions, total_items, completed_items, completion_percentage, due_date || null, priority, status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'AI checklist not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating AI checklist:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// AI Progress Controller
const aiProgressController = {
  ...createCrudController('ai_progress', {
    searchableColumns: ['user_name', 'goal_type', 'goal_description'],
    filterableColumns: ['goal_type', 'trend', 'status'],
    defaultSort: 'created_at'
  }),

  create: async (req, res) => {
    try {
      const { user_id, user_name, goal_type, goal_description, current_value, target_value, ai_insights, ai_recommendations, milestones, trend, target_date, status } = req.body;
      const progress_percentage = target_value > 0 ? (current_value / target_value) * 100 : 0;
      const result = await pool.query(
        `INSERT INTO ai_progress (user_id, user_name, goal_type, goal_description, current_value, target_value, progress_percentage, ai_insights, ai_recommendations, milestones, trend, target_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [user_id, user_name, goal_type, goal_description, current_value || 0, target_value, progress_percentage, ai_insights, ai_recommendations ? JSON.stringify(ai_recommendations) : '[]', milestones ? JSON.stringify(milestones) : '[]', trend || 'stable', target_date || null, status || 'in_progress']
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating AI progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { goal_description, current_value, target_value, ai_insights, ai_recommendations, milestones, trend, target_date, status } = req.body;
      const progress_percentage = target_value > 0 ? (current_value / target_value) * 100 : 0;
      const result = await pool.query(
        `UPDATE ai_progress SET goal_description = $1, current_value = $2, target_value = $3, progress_percentage = $4, ai_insights = $5,
         ai_recommendations = $6, milestones = $7, trend = $8, target_date = $9, status = $10, last_updated = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 RETURNING *`,
        [goal_description, current_value, target_value, progress_percentage, ai_insights, ai_recommendations ? JSON.stringify(ai_recommendations) : '[]', milestones ? JSON.stringify(milestones) : '[]', trend, target_date || null, status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'AI progress not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating AI progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const [flows, segments, templates, analytics, ptoRequests, mentorMatches, feedback, training, aiChecklists, aiProgress, integrations, tooltips] = await Promise.all([
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'active\')::int as active FROM onboarding_flows'),
      pool.query('SELECT COUNT(*)::int as total, COALESCE(SUM(user_count), 0)::int as total_users FROM user_segments'),
      pool.query('SELECT COUNT(*)::int as total FROM templates'),
      pool.query('SELECT COALESCE(AVG(metric_value), 0) as avg_completion FROM analytics WHERE metric_name = \'completion_rate\''),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'pending\')::int as pending FROM pto_requests'),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'active\')::int as active FROM mentor_matches'),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'new\' OR status = \'open\')::int as open FROM feedback'),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'in_progress\')::int as in_progress FROM training_recommendations'),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'active\')::int as active FROM ai_checklists'),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'in_progress\')::int as in_progress FROM ai_progress'),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status = \'active\')::int as active FROM integrations'),
      pool.query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE is_active = true)::int as active FROM tooltips')
    ]);

    const stats = {
      totalFlows: flows.rows[0]?.total || 0,
      activeFlows: flows.rows[0]?.active || 0,
      totalSegments: segments.rows[0]?.total || 0,
      totalUsersInSegments: segments.rows[0]?.total_users || 0,
      totalTemplates: templates.rows[0]?.total || 0,
      avgCompletionRate: parseFloat(analytics.rows[0]?.avg_completion) || 0,
      totalPtoRequests: ptoRequests.rows[0]?.total || 0,
      pendingPtoRequests: ptoRequests.rows[0]?.pending || 0,
      totalMentorMatches: mentorMatches.rows[0]?.total || 0,
      activeMentorMatches: mentorMatches.rows[0]?.active || 0,
      totalFeedback: feedback.rows[0]?.total || 0,
      openFeedback: feedback.rows[0]?.open || 0,
      totalTraining: training.rows[0]?.total || 0,
      inProgressTraining: training.rows[0]?.in_progress || 0,
      totalAiChecklists: aiChecklists.rows[0]?.total || 0,
      activeAiChecklists: aiChecklists.rows[0]?.active || 0,
      totalAiProgress: aiProgress.rows[0]?.total || 0,
      inProgressAiProgress: aiProgress.rows[0]?.in_progress || 0,
      totalIntegrations: integrations.rows[0]?.total || 0,
      activeIntegrations: integrations.rows[0]?.active || 0,
      totalTooltips: tooltips.rows[0]?.total || 0,
      activeTooltips: tooltips.rows[0]?.active || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  flowsController,
  stepsController,
  segmentsController,
  templatesController,
  aiContentController,
  analyticsController,
  integrationsController,
  tooltipsController,
  checklistsController,
  progressController,
  abTestsController,
  triggersController,
  personalizationController,
  notificationsController,
  ptoRequestsController,
  mentorMatchesController,
  feedbackController,
  trainingRecommendationsController,
  aiChecklistsController,
  aiProgressController,
  getDashboardStats
};
