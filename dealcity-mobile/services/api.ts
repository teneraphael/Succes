// Remplace cette URL par l'adresse de ton backend (ex: ton IP locale en dev, ou ton URL de production)
const API_URL = 'https://api.dealcity.app/v1'; 

export async function fetchPosts() {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des posts :", error);
    return [];
  }
}

export async function createPost(postData: { title: string; price: string; location: string; description: string }) {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la création du post :", error);
    throw error;
  }
}