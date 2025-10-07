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
    
    let prompt = `Generálj egy listát 40 kitalált, de valósághű akciós termékről a következő magyarországi üzletláncokból: Tesco, Auchan, Lidl, Aldi, Spar, Penny. A termékek legyenek változatosak. Minden termékhez adj meg egy kategóriát a következő listából: ${categories.join(', ')}. Az árak Forintban legyenek. A kép URL-hez használj a source.unsplash.com szolgáltatást, hogy valósághű, a termékhez releváns képet kapjunk. A formátum legyen 'https://source.unsplash.com/400x400/?{termek_neve_angolul}'. Például 'csirkemell' esetén '?chicken-breast', 'narancslé' esetén '?orange-juice'. Biztosítsd, hogy a kulcsszavak relevánsak legyenek a termékhez, és a kép egyértelműen ábrázolja a terméket. Az akciók érvényessége a mai naptól számított 3-10 napon belül járjon le.`;

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

export const fetchAIResponse = async (
  query: string,
  allProducts: Product[]
): Promise<{ responseText: string; relevantProductIds: string[] }> => {
  try {
    // To keep the prompt within reasonable limits, we only send essential data.
    const productContext = allProducts.map(p => ({
        id: p.id,
        name: p.name,
        store: p.store,
        category: p.category,
        salePrice: p.salePrice,
        unit: p.unit,
    }));

    const prompt = `Te vagy az 'Akcióvadász AI', egy segítőkész és barátságos vásárlási asszisztens egy magyar szupermarket-akciós alkalmazásban. A célod, hogy segíts a felhasználóknak megtalálni a legjobb akciókat, ételeket tervezni és pénzt spórolni a jelenleg elérhető akciós termékek alapján. A válaszodat magyarul add meg.

Itt van az összes jelenleg akciós termék listája JSON formátumban. Csak ezeket a termékeket használd a felhasználó kérdésének megválaszolásához:
${JSON.stringify(productContext)}

A felhasználó kérése a következő: "${query}"

A válaszodnak JSON formátumúnak kell lennie. A JSON objektumnak két kulcsot kell tartalmaznia: "responseText" és "relevantProductIds".
- responseText: Egy barátságos, beszédes és segítőkész szöveges válasz a felhasználó kérdésére magyarul. Ha termékeket javasolsz, említsd meg őket név szerint a válaszodban.
- relevantProductIds: Egy string tömb, amely a megadott listából származó termékek "id"-jait tartalmazza, amelyek a leginkább relevánsak a válaszodhoz. Csak azokat az azonosítókat add meg, amelyeket megemlítettél, vagy közvetlenül kapcsolódnak a felhasználó kéréséhez. Ha egyetlen termék sem releváns, adj vissza egy üres tömböt.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseText: {
              type: Type.STRING,
              description: "A szöveges, barátságos válasz a felhasználónak."
            },
            relevantProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A releváns termékek azonosítóinak listája."
            },
          },
          required: ["responseText", "relevantProductIds"],
        },
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    
    if (data && data.responseText && Array.isArray(data.relevantProductIds)) {
        return data as { responseText: string; relevantProductIds: string[] };
    }
    
    throw new Error("Invalid response format from AI.");

  } catch (error) {
    console.error("Hiba az AI válaszának lekérése közben:", error);
    throw new Error("Nem sikerült választ kapni az AI-tól. Kérjük, próbálja újra később.");
  }
};