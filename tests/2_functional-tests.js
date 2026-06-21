const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  const testProject = 'fcc-test-project-' + Date.now();

  test('Create an issue with every field: POST request to /api/issues/{project}', async function () {
    const res = await chai.request(server)
      .post('/api/issues/' + testProject)
      .type('form')
      .send({
        issue_title: 'Issue with every field',
        issue_text: 'This issue has every field',
        created_by: 'Alejandro',
        assigned_to: 'freeCodeCamp',
        status_text: 'In progress'
      });

    assert.equal(res.status, 200);
    assert.isObject(res.body);
    assert.equal(res.body.issue_title, 'Issue with every field');
    assert.equal(res.body.issue_text, 'This issue has every field');
    assert.equal(res.body.created_by, 'Alejandro');
    assert.equal(res.body.assigned_to, 'freeCodeCamp');
    assert.equal(res.body.status_text, 'In progress');
    assert.isTrue(res.body.open);
    assert.property(res.body, 'created_on');
    assert.property(res.body, 'updated_on');
    assert.property(res.body, '_id');
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', async function () {
    const res = await chai.request(server)
      .post('/api/issues/' + testProject)
      .type('form')
      .send({
        issue_title: 'Only required fields',
        issue_text: 'This issue only has required fields',
        created_by: 'Alejandro'
      });

    assert.equal(res.status, 200);
    assert.isObject(res.body);
    assert.equal(res.body.issue_title, 'Only required fields');
    assert.equal(res.body.issue_text, 'This issue only has required fields');
    assert.equal(res.body.created_by, 'Alejandro');
    assert.equal(res.body.assigned_to, '');
    assert.equal(res.body.status_text, '');
    assert.isTrue(res.body.open);
    assert.property(res.body, '_id');
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', async function () {
    const res = await chai.request(server)
      .post('/api/issues/' + testProject)
      .type('form')
      .send({
        issue_title: 'Missing fields'
      });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      error: 'required field(s) missing'
    });
  });

  test('View issues on a project: GET request to /api/issues/{project}', async function () {
    const project = 'get-project-' + Date.now();

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'First issue',
        issue_text: 'Text 1',
        created_by: 'User 1'
      });

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'Second issue',
        issue_text: 'Text 2',
        created_by: 'User 2'
      });

    const res = await chai.request(server)
      .get('/api/issues/' + project);

    assert.equal(res.status, 200);
    assert.isArray(res.body);
    assert.lengthOf(res.body, 2);
    assert.property(res.body[0], 'issue_title');
    assert.property(res.body[0], 'issue_text');
    assert.property(res.body[0], 'created_by');
    assert.property(res.body[0], 'assigned_to');
    assert.property(res.body[0], 'status_text');
    assert.property(res.body[0], 'open');
    assert.property(res.body[0], 'created_on');
    assert.property(res.body[0], 'updated_on');
    assert.property(res.body[0], '_id');
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', async function () {
    const project = 'one-filter-project-' + Date.now();

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'Filter issue 1',
        issue_text: 'Text',
        created_by: 'Alice'
      });

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'Filter issue 2',
        issue_text: 'Text',
        created_by: 'Alice'
      });

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'Filter issue 3',
        issue_text: 'Text',
        created_by: 'Bob'
      });

    const res = await chai.request(server)
      .get('/api/issues/' + project)
      .query({ created_by: 'Alice' });

    assert.equal(res.status, 200);
    assert.isArray(res.body);
    assert.lengthOf(res.body, 2);
    assert.equal(res.body[0].created_by, 'Alice');
    assert.equal(res.body[1].created_by, 'Alice');
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', async function () {
    const project = 'multiple-filter-project-' + Date.now();

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'Multi filter 1',
        issue_text: 'Text',
        created_by: 'Alice',
        assigned_to: 'Bob'
      });

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'Multi filter 2',
        issue_text: 'Text',
        created_by: 'Alice',
        assigned_to: 'Bob'
      });

    await chai.request(server)
      .post('/api/issues/' + project)
      .type('form')
      .send({
        issue_title: 'Multi filter 3',
        issue_text: 'Text',
        created_by: 'Alice',
        assigned_to: 'Eric'
      });

    const res = await chai.request(server)
      .get('/api/issues/' + project)
      .query({
        created_by: 'Alice',
        assigned_to: 'Bob'
      });

    assert.equal(res.status, 200);
    assert.isArray(res.body);
    assert.lengthOf(res.body, 2);
    assert.equal(res.body[0].created_by, 'Alice');
    assert.equal(res.body[0].assigned_to, 'Bob');
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', async function () {
    const createRes = await chai.request(server)
      .post('/api/issues/' + testProject)
      .type('form')
      .send({
        issue_title: 'Update one field',
        issue_text: 'Old text',
        created_by: 'Alejandro'
      });

    const id = createRes.body._id;

    const updateRes = await chai.request(server)
      .put('/api/issues/' + testProject)
      .type('form')
      .send({
        _id: id,
        issue_text: 'New text'
      });

    assert.equal(updateRes.status, 200);
    assert.deepEqual(updateRes.body, {
      result: 'successfully updated',
      _id: id
    });

    const getRes = await chai.request(server)
      .get('/api/issues/' + testProject)
      .query({ _id: id });

    assert.equal(getRes.body[0].issue_text, 'New text');
    assert.isAbove(
      Date.parse(getRes.body[0].updated_on),
      Date.parse(getRes.body[0].created_on)
    );
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', async function () {
    const createRes = await chai.request(server)
      .post('/api/issues/' + testProject)
      .type('form')
      .send({
        issue_title: 'Update many fields',
        issue_text: 'Old text',
        created_by: 'Alejandro'
      });

    const id = createRes.body._id;

    const updateRes = await chai.request(server)
      .put('/api/issues/' + testProject)
      .type('form')
      .send({
        _id: id,
        issue_title: 'Updated title',
        issue_text: 'Updated text',
        assigned_to: 'Teacher'
      });

    assert.equal(updateRes.status, 200);
    assert.deepEqual(updateRes.body, {
      result: 'successfully updated',
      _id: id
    });

    const getRes = await chai.request(server)
      .get('/api/issues/' + testProject)
      .query({ _id: id });

    assert.equal(getRes.body[0].issue_title, 'Updated title');
    assert.equal(getRes.body[0].issue_text, 'Updated text');
    assert.equal(getRes.body[0].assigned_to, 'Teacher');
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', async function () {
    const res = await chai.request(server)
      .put('/api/issues/' + testProject)
      .type('form')
      .send({
        issue_text: 'Trying to update without id'
      });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      error: 'missing _id'
    });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', async function () {
    const id = 'bad-id-no-fields';

    const res = await chai.request(server)
      .put('/api/issues/' + testProject)
      .type('form')
      .send({
        _id: id
      });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      error: 'no update field(s) sent',
      _id: id
    });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', async function () {
    const id = 'invalid-id-update';

    const res = await chai.request(server)
      .put('/api/issues/' + testProject)
      .type('form')
      .send({
        _id: id,
        issue_text: 'This should not update'
      });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      error: 'could not update',
      _id: id
    });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', async function () {
    const createRes = await chai.request(server)
      .post('/api/issues/' + testProject)
      .type('form')
      .send({
        issue_title: 'Delete this issue',
        issue_text: 'This issue will be deleted',
        created_by: 'Alejandro'
      });

    const id = createRes.body._id;

    const deleteRes = await chai.request(server)
      .delete('/api/issues/' + testProject)
      .type('form')
      .send({
        _id: id
      });

    assert.equal(deleteRes.status, 200);
    assert.deepEqual(deleteRes.body, {
      result: 'successfully deleted',
      _id: id
    });

    const getRes = await chai.request(server)
      .get('/api/issues/' + testProject)
      .query({ _id: id });

    assert.isArray(getRes.body);
    assert.lengthOf(getRes.body, 0);
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', async function () {
    const id = 'invalid-id-delete';

    const res = await chai.request(server)
      .delete('/api/issues/' + testProject)
      .type('form')
      .send({
        _id: id
      });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      error: 'could not delete',
      _id: id
    });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', async function () {
    const res = await chai.request(server)
      .delete('/api/issues/' + testProject)
      .type('form')
      .send({});

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      error: 'missing _id'
    });
  });
});