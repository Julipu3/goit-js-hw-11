import axios from "axios";

export async function fetchImages(query, page, limit) {
    try {
      const apiKey = '38590666-b4e4facc0390580085af70521';
      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: apiKey,
          q: query,
          page: page,
          per_page: limit,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
        },
      });
  
      return response.data;
    } catch (error) {
      throw error;
    }
  }