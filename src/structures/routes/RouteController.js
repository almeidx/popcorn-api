import qs from 'querystring';
import fetch from 'node-fetch';
import { baseURL } from 'core/Constants';

/**
 * Creates a new RouteController
 * @class
 */
export default class RouteController {

  /**
   * @type {Object}
   * @prop {string} tab The tab to route in
   * @prop {(Show | Anime | Movie)} dataClass The base class of this route
   */
  constructor({ tab, dataClass }) {
    this.tab = tab;
    this.dataClass = dataClass
  }

  /**
   * Get the number of pages in this tab
   * @returns {Promise<number>}
   */
  pages() {
    return this._request(`/${this.tab}s`).then(p => p.length);
  }

  /**
   * Searches in this route
   * @type {Object}
   * @prop {number} [page=1] The page to search
   * @prop {string} [sort='trending'] The way you want to sort. Can be `name`, `rating`, `released`, `updated`, `trending`, `year`
   * @prop {number} [order=-1] The order you want to sort
   * @prop {string} [genre='all'] The genre to filter
   * @prop {string} [query] The query to search
   * @returns {Promise<Array<(Show | Anime | Movie)>>}
   */
  search({page = 1, sort = 'trending', order = -1, genre = 'all', query} = {}) {
    return this._request(`/${this.tab}s/${page}`, {sort, order, genre, keywords: query}).then(values => {
      return values.map(value => new this.dataClass(this, value));
    });
  }

  /**
   * Gets a random item of this route
   * @returns {Promise<(Show | Anime | Movie)>}
   */
  random() {
    return this._request(`/random/${this.tab}`).then(value => new this.dataClass(this, value));
  }

  /**
   * Gets the details of an item from its ID
   * @param {string} id The ID to get
   * @returns {Promise<(Show | Anime | Movie)>}
   */
  get(id) {
    return this._rawDetails(id).then(value => new this.dataClass(this, value));
  }

  /**
   * Gets the raw details from an ID
   * @param {string} id
   * @returns {Promise<Object>}
   * @private
   */
  _rawDetails(id) {
    if (typeof id === 'object') id = id.id;
    return this._request(`/${this.tab}/${id}`).then(data => {
      data.details = true;
      return data;
    });
  }

  /**
   * Requests to this route
   * @param {string} endpoint The endpoint
   * @param {Object} queryParams The parameters to the request
   * @returns {Promise<Object>}
   * @private
   */
  _request(endpoint, queryParams = {}) {
    queryParams = qs.stringify(queryParams);
    return fetch(`${baseURL}${endpoint}?${queryParams}`).then(r => r.json());
  }
}