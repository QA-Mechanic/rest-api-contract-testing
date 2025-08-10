const { Pact } = require('@pact-foundation/pact');
const { like, eachLike } = require('@pact-foundation/pact').MatchersV3;
const axios = require('axios');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;

require('dotenv').config();

class JSONPlaceholderClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({ 
      baseURL: baseUrl,
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  async getAllPosts() {
    const response = await this.axios.get('/posts');
    return response.data;
  }

  async getPostById(id) {
    const response = await this.axios.get(`/posts/${id}`);
    return response.data;
  }
}

const provider = new Pact({
  consumer: 'test-app-consumer',
  provider: 'jsonplaceholder-provider',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'INFO'
});

describe('JSONPlaceholder API Contract Tests', () => {
  let apiClient;

  before(async () => {
    await provider.setup();
    apiClient = new JSONPlaceholderClient('http://localhost:1234');
  });

  after(async () => {
    await provider.finalize();
  });

  afterEach(async () => {
    await provider.verify();
  });

  describe('GET /posts - Retrieve all posts', () => {
    before(async () => {
      await provider.addInteraction({
        state: 'posts exist',
        uponReceiving: 'a request to get all posts',
        withRequest: {
          method: 'GET',
          path: '/posts'
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: eachLike({
            userId: like(1),
            id: like(1),
            title: like('Sample Post Title'),
            body: like('Sample post content here')
          })
        }
      });
    });

    it('should return a list of posts', async () => {
      const posts = await apiClient.getAllPosts();
      
      expect(posts).to.be.an('array');
      expect(posts.length).to.be.at.least(1);
      expect(posts[0]).to.have.property('userId');
      expect(posts[0]).to.have.property('id');
      expect(posts[0]).to.have.property('title');
      expect(posts[0]).to.have.property('body');
    });
  });
});
