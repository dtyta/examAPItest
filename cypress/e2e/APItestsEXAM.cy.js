import { faker } from '@faker-js/faker';
import * as helper from '../support/helper' 

const randomEmail = faker.internet.email();
const randomPassword = faker.internet.password();
const randomFirstName = faker.name.firstName();
const randomLastName = faker.name.lastName();
const randomAge = Math.floor(Math.random() * (60 - 18 + 1) + 18);


it('API test for exam', () => {
  cy.log('1.Get all posts');
  cy.request('GET', 'posts').then(response => {
    expect(response.status).to.be.eq(200)
    expect(response.headers).to.have.property('content-type', 'application/json; charset=utf-8');
  });

  cy.log('2.Get first 10 posts');
  cy.request('GET', 'posts?_limit=10').then(response => {
    expect(response.status).to.be.eq(200)
    cy.log(response.body);
  });

  cy.log('3.Get posts with id-55 an id-60');
  cy.request('GET', 'posts?id=55&id=60').then(response => {
    expect(response.status).to.be.eq(200)
    const posts = response.body;
    const postIds = posts.map(post => post.id);
    expect(postIds).to.include(55);
    expect(postIds).to.include(60);
  });

  cy.log('4.Create post');
  cy.request({
    method: 'POST',
    url: '664/posts',
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.eq(401)
  });

  cy.log('5.Create post with adding access token in header');
    
  let accessToken;
  cy.log('User registration for obtaining an access token.');
  cy.request({
    method: 'POST',
    url: 'register',
    body: {
      email: randomEmail,
      password: randomPassword,
      firstname: randomFirstName,
      lastname: randomLastName,
      age: randomAge
    }
  }).then(response => {
    expect(response.status).to.be.eq(201)
    accessToken = response.body.accessToken;
  });
    
  cy.log('Create post with adding access token in header')
  cy.request({
    method: 'GET',
    url: '664/posts',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).then((response) => {
    expect(response.status).to.be.eq(200);
    expect(response.body).to.be.an('array').that.satisfies((posts) => {
      return posts.some((post) => {
        return typeof post.id === 'number';
      })
    }

    )
  });

  cy.log('6.Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.');
  const title = helper.title;
  const content = helper.content;
  const author = helper.author
  cy.request({
    method: 'POST',
    url: '/posts',
    body: {
      title,
      content,
      author
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }).then((response) => {
    expect(response.status).to.be.eq(201);
    expect(response.body).to.have.property('id');
    expect(response.body.title).to.be.eq(title);
    expect(response.body.content).to.be.eq(content);
    expect(response.body.author).to.be.eq(author);

  });
  
  cy.log('7. Update non-existing entity. Verify HTTP response status code.');
  
  cy.request({
    method: 'PUT',
    url: 'posts',
    failOnStatusCode: false,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    expect(response.status).to.be.eq(404);
    
  });

  cy.log('8. Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.');
  
  cy.log('Create entity');
  cy.request({
    method: 'POST',
    url: '/posts',
    body: {
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      userId: faker.number.int(10)
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    expect(response.status).to.be.eq(201);
  
    const createdPost = response.body;
    cy.log('Update entity');
    cy.request({
      method: 'PUT',
      url: `/posts/${createdPost.id}`,
      body: {
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        userId: faker.number.int(10)
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((updateResponse) => {
      expect(updateResponse.status).to.be.eq(200);
  
      const updatedPost = updateResponse.body;

      expect(updatedPost.title).to.not.be.eq(createdPost.title);
      expect(updatedPost.body).to.not.be.eq(createdPost.body);
      expect(updatedPost.userId).to.not.be.eq(createdPost.userId);
    });
  });

  cy.log('9. Delete non-existing post entity. Verify HTTP response status code.');
  cy.request({
    method: 'DELETE',
    url: 'posts',
    failOnStatusCode: false,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    expect(response.status).to.be.eq(404);
    
  });


  cy.log('10.Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.');

  cy.log('Create entity');
  cy.request({
    method: 'POST',
    url: '/posts',
    body: {
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      userId: faker.number.int(10)
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((createResponse) => {
    expect(createResponse.status).to.be.eq(201);
  
    const createdPost = createResponse.body;
  
    cy.log('Update entity');
    cy.request({
      method: 'PUT',
      url: `/posts/${createdPost.id}`,
      body: {
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        userId: faker.number.int(10)
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((updateResponse) => {
      expect(updateResponse.status).to.be.eq(200);
  
      const updatedPost = updateResponse.body;
  
      expect(updatedPost.title).to.be.not.eq(createdPost.title);
      expect(updatedPost.body).to.be.not.eq(createdPost.body);
      expect(updatedPost.userId).to.be.not.eq(createdPost.userId);
  
      cy.log('Delete entity');
      cy.request({
        method: 'DELETE',
        url: `/posts/${updatedPost.id}`,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.be.eq(200);
  
        cy.log('Verify that entity was deleted');
        cy.request({
          method: 'GET',
          url: `/posts/${updatedPost.id}`,
          headers: {
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((getResponse) => {
          expect(getResponse.status).to.be.eq(404);
        });
      });
    });
  });









  
  
  })










