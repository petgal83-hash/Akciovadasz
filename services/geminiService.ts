import { GoogleGenAI, Type } from "@google/genai";
import { Product, Store } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Location {
  latitude: number;
  longitude: number;
}

export const fetchDeals = async (searchTerm?: string, location?: Location): Promise<Product[]> => {
  console.log("Fetching deals from Gemini API...", { searchTerm, location });

  const productSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "A unique identifier for the product, e.g., 'prod_1'." },
      name: { type: Type.STRING, description: "The name of the product in Hungarian." },
      store: { type: Type.STRING, enum: Object.values(Store), description: "The supermarket chain." },
      category: { type: Type.STRING, description: "The product category in Hungarian." },
      originalPrice: { type: Type.NUMBER, description: "The original price in HUF." },
      salePrice: { type: Type.NUMBER, description: "The discounted price in HUF." },
      discountPercentage: { type: Type.NUMBER, description: "The discount percentage as a whole number (e.g., 25 for 25%)." },
      validUntil: { type: Type.STRING, description: "The expiry date of the promotion in YYYY-MM-DD format." },
      imageUrl: { type: Type.STRING, description: "A placeholder image URL for the product from source.unsplash.com." },
      unit: { type: Type.STRING, description: "The unit of the product (e.g., 'kg', 'l', 'db')." }
    },
    required: ['id', 'name', 'store', 'category', 'originalPrice', 'salePrice', 'discountPercentage', 'validUntil', 'imageUrl', 'unit']
  };

  const dealsSchema = {
    type: Type.ARRAY,
    items: productSchema
  };

  const searchTermClause = searchTerm ? `Pay special attention to and include several products related to "${searchTerm}".` : '';
  const locationClause = location ? `Slightly prioritize deals from stores that are more common across Hungary.` : '';

  const prompt = `
    You are an API that generates realistic promotional product data for major Hungarian supermarket chains.
    The supermarkets are: ${Object.values(Store).join(', ')}.
    Generate a list of 40 diverse promotional products. The products should cover categories like 'Zöldség & Gyümölcs', 'Pékáru', 'Tejtermék & Tojás', 'Hús & Hal', 'Italok', 'Alapvető élelmiszerek', 'Háztartási cikkek', 'Szépségápolás'.
    Ensure the data is realistic, with plausible original and sale prices in HUF, and discount percentages.
    The 'validUntil' date should be within the next 3 to 10 days from today's date.
    Product names should be in Hungarian.
    For imageUrl, generate a relevant query string for source.unsplash.com like 'https://source.unsplash.com/400x400/?fresh-chicken-breast,food'.
    The unit can be 'kg', 'l', or 'db' (darab/piece).

    ${searchTermClause}
    ${locationClause}

    Return the response as a JSON array matching the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: dealsSchema,
      },
    });
    
    const products = JSON.parse(response.text);
    if (!Array.isArray(products)) {
        console.error("Gemini response for deals is not an array:", products);
        return [];
    }
    return products as Product[];
  } catch (error) {
    console.error("Error fetching deals from Gemini:", error);
    return []; // Fallback to empty array on error
  }
};

export const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 2) {
    return Promise.resolve([]);
  }

  const suggestionsSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  };

  const prompt = `
    You are an API that provides search suggestions for a Hungarian grocery deals app.
    Based on the user's partial search query: "${query}"
    Generate a list of 5 relevant and popular search suggestions. The suggestions should be short and in Hungarian.
    Return the response as a JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: suggestionsSchema,
        },
    });

    const suggestions = JSON.parse(response.text);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error("Error fetching suggestions from Gemini:", error);
    return [];
  }
};

export const fetchAIResponse = async (
  query: string,
  allProducts: Product[]
): Promise<{ responseText: string; relevantProductIds: string[] }> => {
  const aiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: {
            type: Type.STRING,
            description: "A conversational, helpful response to the user's query in Hungarian."
        },
        relevantProductIds: {
            type: Type.ARRAY,
            description: "An array of product IDs from the provided list that are relevant to the query.",
            items: { type: Type.STRING }
        }
    },
    required: ['responseText', 'relevantProductIds']
  };

  // Simplify product data to save tokens
  const productContext = allProducts.map(
      ({ id, name, store, category, salePrice, unit }) => 
      ({ id, name, store, category, salePrice, unit })
  );

  const prompt = `
    You are a friendly and helpful Hungarian shopping assistant for a grocery deals app called 'Akcióvadász'.
    A user has asked the following question: "${query}"

    Here is a list of all currently available promotional products:
    ${JSON.stringify(productContext)}

    Your task is to:
    1.  Provide a conversational, helpful, and concise response in Hungarian to the user's query. The response should be natural and suggest some of the available products if they are relevant.
    2.  Identify the products from the provided list that are most relevant to the user's query.

    Return your answer in a JSON object format, according to the provided schema.
    The response text should be in the 'responseText' field, and an array of the relevant product IDs should be in the 'relevantProductIds' field.
    If no products are relevant, return an empty array for 'relevantProductIds'.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: aiResponseSchema,
            },
        });

        const result = JSON.parse(response.text);
        return result;
    } catch (error) {
        console.error("Error fetching AI response from Gemini:", error);
        return { 
            responseText: "Sajnos hiba történt a válasz feldolgozása közben. Kérlek, próbáld újra később.", 
            relevantProductIds: [] 
        };
    }
};
