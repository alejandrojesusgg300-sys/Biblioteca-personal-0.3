'use strict';

const issuesByProject = {};

function createId() {
  return Date.now().toString(16) + Math.random().toString(16).slice(2);
}

function getProjectIssues(project) {
  if (!issuesByProject[project]) {
    issuesByProject[project] = [];
  }

  return issuesByProject[project];
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function parseOpenValue(value) {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return value;
}

module.exports = function (app) {
  app.route('/api/issues/:project')

    .get(function (req, res) {
      const project = req.params.project;
      const projectIssues = getProjectIssues(project);
      const filters = req.query;

      const filteredIssues = projectIssues.filter(function (issue) {
        for (let key in filters) {
          if (String(issue[key]) !== String(filters[key])) {
            return false;
          }
        }

        return true;
      });

      res.json(filteredIssues);
    })

    .post(function (req, res) {
      const project = req.params.project;
      const projectIssues = getProjectIssues(project);

      const issue_title = req.body.issue_title;
      const issue_text = req.body.issue_text;
      const created_by = req.body.created_by;
      const assigned_to = req.body.assigned_to || '';
      const status_text = req.body.status_text || '';

      if (!hasValue(issue_title) || !hasValue(issue_text) || !hasValue(created_by)) {
        return res.json({ error: 'required field(s) missing' });
      }

      const now = new Date().toISOString();

      const newIssue = {
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to,
        status_text: status_text,
        open: true,
        created_on: now,
        updated_on: now,
        _id: createId()
      };

      projectIssues.push(newIssue);

      res.json(newIssue);
    })

    .put(function (req, res) {
      const project = req.params.project;
      const projectIssues = getProjectIssues(project);

      const _id = req.body._id;

      if (!hasValue(_id)) {
        return res.json({ error: 'missing _id' });
      }

      const fieldsAllowed = [
        'issue_title',
        'issue_text',
        'created_by',
        'assigned_to',
        'status_text',
        'open'
      ];

      const fieldsToUpdate = {};

      fieldsAllowed.forEach(function (field) {
        if (hasValue(req.body[field])) {
          fieldsToUpdate[field] = req.body[field];
        }
      });

      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({
          error: 'no update field(s) sent',
          _id: _id
        });
      }

      const issue = projectIssues.find(function (item) {
        return item._id === _id;
      });

      if (!issue) {
        return res.json({
          error: 'could not update',
          _id: _id
        });
      }

      Object.keys(fieldsToUpdate).forEach(function (field) {
        if (field === 'open') {
          issue[field] = parseOpenValue(fieldsToUpdate[field]);
        } else {
          issue[field] = fieldsToUpdate[field];
        }
      });

      const now = new Date();
      const createdTime = Date.parse(issue.created_on);

      if (now.getTime() <= createdTime) {
        issue.updated_on = new Date(createdTime + 1000).toISOString();
      } else {
        issue.updated_on = now.toISOString();
      }

      res.json({
        result: 'successfully updated',
        _id: _id
      });
    })

    .delete(function (req, res) {
      const project = req.params.project;
      const projectIssues = getProjectIssues(project);

      const _id = req.body._id;

      if (!hasValue(_id)) {
        return res.json({ error: 'missing _id' });
      }

      const issueIndex = projectIssues.findIndex(function (issue) {
        return issue._id === _id;
      });

      if (issueIndex === -1) {
        return res.json({
          error: 'could not delete',
          _id: _id
        });
      }

      projectIssues.splice(issueIndex, 1);

      res.json({
        result: 'successfully deleted',
        _id: _id
      });
    });
};