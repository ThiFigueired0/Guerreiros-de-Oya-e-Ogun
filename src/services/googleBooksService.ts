export interface GoogleBook {
  id: string;
  title: string;
  authors: string;
  coverUrl: string | null;
  description: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY || '';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Searches for books using the Google Books API.
 * @param query The search term (title, author, etc.)
 * @returns A promise that resolves to a list of transformed book data.
 */
export const searchBooks = async (query: string): Promise<GoogleBook[]> => {
  if (!query) return [];

  try {
    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => {
      const volumeInfo = item.volumeInfo || {};
      
      // Ensure HTTPS for images
      let coverUrl = volumeInfo.imageLinks?.thumbnail || null;
      if (coverUrl && coverUrl.startsWith('http://')) {
        coverUrl = coverUrl.replace('http://', 'https://');
      }

      return {
        id: item.id,
        title: volumeInfo.title || 'Título indisponível',
        authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
        coverUrl,
        description: volumeInfo.description || 'Sem descrição disponível.',
      };
    });
  } catch (error) {
    console.error('Error fetching books from Google Books:', error);
    throw error;
  }
};
