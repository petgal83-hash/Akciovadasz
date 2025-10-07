import { GoogleGenAI, Type } from "@google/genai";
import { Product, Store } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Egyedi azonosító" },
    name: { type: Type.STRING, description: "A termék neve" },
    store: {
      type: Type.STRING,
      enum: Object.values(Store),
      description: "Az üzletlánc neve",
    },
    category: {
      type: Type.STRING,
      description: "A termék kategóriája a megadott listából.",
    },
    originalPrice: { type: Type.NUMBER, description: "Eredeti ár Forintban" },
    salePrice: { type: Type.NUMBER, description: "Akciós ár Forintban" },
    discountPercentage: {
      type: Type.INTEGER,
      description: "A kedvezmény százalékos mértéke",
    },
    validUntil: {
      type: Type.STRING,
      description: "Az akció érvényességének vége, YYYY-MM-DD formátum.",
    },
    imageUrl: { type: Type.STRING, description: "URL a termék képéhez" },
    unit: { type: Type.STRING, description: "Mértékegység (pl. kg, l, db)" },
  },
  required: [
    "id",
    "name",
    "store",
    "category",
    "originalPrice",
    "salePrice",
    "discountPercentage",
    "validUntil",
    "imageUrl",
    "unit",
  ],
};

interface Location {
  latitude: number;
  longitude: number;
}

export const fetchDeals = async (searchTerm?: string, location?: Location): Promise<Product[]> => {
  try {
    const categories = ['Zöldség & Gyümölcs', 'Pékáru', 'Tejtermék & Tojás', 'Hús & Hal', 'Italok', 'Alapvető élelmiszerek', 'Háztartási cikkek', 'Szépségápolás'];
    
    let prompt = `Generálj egy listát 40 kitalált, de valósághű akciós termékről a következő magyarországi üzletláncokból: Tesco, Auchan, Lidl, Aldi, Spar, Penny. A termékek legyenek változatosak. Minden termékhez adj meg egy kategóriát a következő listából: ${categories.join(', ')}. Az árak Forintban legyenek. A kép URL-hez használj releváns, valósághű, professzionális termékfotókat az Unsplash API-n keresztül (pl. https://source.unsplash.com/400x400/?{kifejező_kulcsszavak}). A kulcsszavak legyenek specifikusak a termékre, például 'csomagolt csirkemell', 'friss eper egy kosárban', 'szeletelt kenyér'. Kerüld az általános kategórianeveket a képkeresésben, hogy a képek minél élethűbbek legyenek, mintha egy webshopból származnának. Az akciók érvényessége a mai naptól számított 3-10 napon belül járjon le.`;

    if (location) {
        prompt += ` A felhasználó jelenlegi pozíciója: szélesség ${location.latitude}, hosszúság ${location.longitude}. Vedd figyelembe ezt a helyzetet, és olyan ajánlatokat preferálj, amelyek relevánsak lehetnek ezen a környéken.`
    }

    if (searchTerm) {
        prompt += ` A felhasználó a következőre keresett rá: "${searchTerm}". Kérlek, a generált termékek relevánsak legyenek erre a keresésre, helyezz előtérbe ilyen típusú termékeket, és a találati lista elsősorban ezeket tartalmazza.`
    }

    prompt += ` A válasz JSON formátumú legyen.`


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: productSchema,
            },
          },
          required: ["products"],
        },
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    if (data && data.products) {
        return data.products as Product[];
    }
    return [];

  } catch (error) {
    console.error("Hiba a Gemini API hívása közben:", error);
    throw new Error("Nem sikerült betölteni az ajánlatokat. Kérjük, próbálja újra később.");
  }
};

export const fetchSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }
  try {
    const prompt = `A felhasználó termékeket keres egy magyar szupermarket-alkalmazásban. A jelenlegi keresési kifejezése: "${query}". Generálj 5 rövid, releváns keresési javaslatot. A javaslatok lehetnek terméknevek, kategóriák vagy kapcsolódó kifejezések. A válasz kizárólag egy JSON string tömb legyen. Például: ["tej", "friss pékáru", "csokoládé", "felvágott", "mosószer"].`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);
    return Array.isArray(suggestions) ? suggestions : [];

  } catch (error) {
    console.error("Hiba a keresési javaslatok lekérése közben:", error);
    return [];
  }
};