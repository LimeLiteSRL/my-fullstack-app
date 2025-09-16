import axios from "axios";
import { MongoClient, Db, Collection } from "mongodb";

export const BASE_URL = "https://www.ubereats.com/";

// API Endpoints
// - /_p/api/getNavigationLinksV1 -> get categories
// - /_p/api/getStoreV1 -> get Store details with "storeUuid" body
// - /_p/api/getCountriesWithCitiesV1 -> get cities
// - /_p/api/getSeoFeedV1 -> get restaurants of cities with "pathname" body
// - /_p/api/getMenuItemV1 -> get meal details with "menuItemUuid","sectionUuid","storeUuid","subsectionUuid" body
// - _p/api/getCategoriesV1 -> get categories of city with pathname and slugName body

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
];

const randomUserAgent =
  userAgents[Math.floor(Math.random() * userAgents.length)];

export const headers = {
  "X-CSRF-Token": "x",
  Referer: "https://www.ubereats.com/city/new-york-city",
  "User-Agent": randomUserAgent,
  "Accept-Language": "en-US,en;q=0.9",
};

export const cookies = `uev2.id.xp=a9cfd889-6089-4022-a5b5-4bb07691810b; dId=1706530a-a9aa-4f56-892c-581d88319b1b; _ua={\"session_id\":\"da8ab3d1-5100-4769-b230-009b682dd70b\",\"session_time_ms\":1731611471721}; marketing_vistor_id=c7796622-67c1-4c89-a07e-433fc12fbb61; uev2.gg=true; utm_medium=undefined; utm_source=undefined; CONSENTMGR=c1:1%7Cc2:1%7Cc3:1%7Cc4:1%7Cc5:1%7Cc6:1%7Cc7:1%7Cc8:1%7Cc9:1%7Cc10:1%7Cc11:1%7Cc12:1%7Cc13:1%7Cc14:1%7Cc15:1%7Cts:1731609676254%7Cconsent:true; _scid=tW7J7RhBtZe1u-qGGsmQfZlzhWhAecTl; _ga=GA1.1.343751689.1731609677; _fbp=fb.1.1731609677800.37669570890951704; _yjsu_yjad=1731609678.ff16df8c-4af3-4247-bb44-a7c001a06c08; _gcl_au=1.1.1735237911.1731609678; _tt_enable_cookie=1; _ttp=_hHaJDvsE2WZb5_2KVx9qehgfrP.tt.1; OTZ=7821770_88_88_104280_84_446940; _hjSessionUser_960703=eyJpZCI6IjM2ZDAwZWJmLWQ4NjMtNTI2My04ZGQxLTNlMDQxZDc1ZjllNCIsImNyZWF0ZWQiOjE3MzE2MTExMzMxNDQsImV4aXN0aW5nIjpmYWxzZX0=; uev2.diningMode=DELIVERY; _uetvid=5b5a5670a2bc11efba2e7ddfc98760a5; _scid_r=xO7J7RhBtZe1u-qGGsmQfZlzhWhAecTl1bGtwQ; _ga_P1RM71MPFP=GS1.1.1732083408.5.0.1732083408.60.0.0; sid=QA.CAESEAQrd904xU6Zmw0HRBIGCdAY1f27uwYiATEqJGUyM2E0MDIzLWJmMjktNGVhZS1iNGI0LWMzM2M5Yzk2NDE4ODI8UANlF_Npos3xm29msyrcrGg836iOIE9NLtnzho_yxytAN-2BDy2_BR2b-VDEudSgARiZfGrTvSV7WCHuOgExQg0udWJlcmVhdHMuY29t.KIyXG9aIAht42ma8aQoxIg4lQ3KXSZJKnQFQdC1QLzg; uev2.id.session=8b0915d9-682f-40c7-8f9b-fb2aedfaeae2; uev2.ts.session=1732735448154; jwt-session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNsYXRlLWV4cGlyZXMtYXQiOjE3MzI3MzcyNDk4OTF9LCJpYXQiOjE3MzI3MzIxMDAsImV4cCI6MTczMjgxODUwMH0.-1wpR0WHoYXDC6PpOAIW7ctW_INuONTcfPuQilyw070; utag_main__sn=7; utag_main_ses_id=1732733690488%3Bexp-session; udi-id=XdEWRGiiL8DnFDFFHaHETRUrJTU1K29cZ9m6QFf0D1VrPH9O42qYrLDfVzb73C7WdZ/bSAX7WNgR17UhWaN/qgYHEWB5+DHOiPd7LupOMJjPCkzLjV9R/xiJIhKYCcNa+XUo/cDGcN2AqGeKlODK1BXlO68SC0kTtAL9SBx/PWl3XB80Vwq6rJhmCdVeXdf710p70+6v4NX1vMVeHxwY0A==n5O1THJve375dbQs93ezlw==9PDq+3XnfceuXXZ3njte3il3JdvYGSO+mOKGWdW90R0=; utag_main__ss=0%3Bexp-session; utag_main__pn=4%3Bexp-session; _userUuid=e23a4023-bf29-4eae-b4b4-c33c9c964188; utag_main__se=10%3Bexp-session; utag_main__st=1732735631337%3Bexp-session`;

const MAX_RETRIES = 0;

// MongoDB connection settings
const MONGO_URI = process.env.DB_URL;
const DB_NAME = "diet";
const INPUT_COLLECTION = "scraping-restaurant-ids";
const OUTPUT_COLLECTION = "scraping-restaurants-to-process";

interface RestaurantId {
  _id: string;
  id: string;
}

interface RestaurantDetail {
  _id?: string;
  name: string;
  slug: string;
  logo: string;
  heroUrl: string;
  cuisineType: string[];
  location: {
    address: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  };
  telephone: string;
  rating: number;
  serviceMode: string[];
  link: string;
  hours: Record<string, string>;
  menu: Array<{
    title: string;
    description: string;
    price: number;
    image: string;
    priceTagline: string;
    link: string;
  }>;
}

async function connectToDatabase(): Promise<Db> {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log("Connected to MongoDB");
  return client.db(DB_NAME);
}

async function loadRestaurantIds(db: Db): Promise<string[]> {
  const collection: Collection<RestaurantId> = db.collection(INPUT_COLLECTION);
  const restaurantIds = await collection.find().toArray();
  return restaurantIds.map((doc) => doc.id);
}

async function loadSavedData(
  db: Db
): Promise<{ data: RestaurantDetail[]; lastIndex: number }> {
  const collection: Collection<RestaurantDetail> =
    db.collection(OUTPUT_COLLECTION);
  const data = await collection.find().toArray();
  const lastIndex = data.length;
  return { data, lastIndex };
}

const calorieRegex = /\(\d+\)\s*-\s*\(\d+\)\s*Cal\./;

function extractMeals(data: any): RestaurantDetail {
  const catalogItemsArray = Object.values(data?.catalogSectionsMap || {})
    .flatMap((section: any) =>
      section?.filter(
        (payload: any) => payload?.payload?.standardItemsPayload?.catalogItems
      )
    )
    .flatMap(
      (payload: any) => payload.payload.standardItemsPayload.catalogItems
    );

  const meals = catalogItemsArray.map((item: any) => {
    const match = item?.priceTagline?.accessibilityText?.match(calorieRegex);
    return {
      title: item?.title,
      description: item?.itemDescription,
      price: item?.price,
      image: item?.imageUrl || "",
      priceTagline: item?.priceTagline?.accessibilityText,
      link: `${item?.sectionUuid}/${item?.subsectionUuid}/${item?.uuid}`,
    };
  });

  const mode = data?.supportedDiningModes
    ?.filter((item: any) => item.isAvailable)
    .map((item: any) => item.title);

  return {
    name: data?.title,
    slug: data?.slug,
    logo: data?.headerBrandingInfo?.logoImageURL || "",
    heroUrl: data.heroImageUrls?.[data.heroImageUrls?.length - 2]?.url,
    cuisineType: data?.cuisineList,
    location: data?.location,
    telephone: data?.phoneNumber || "",
    rating: data?.rating,
    serviceMode: mode,
    link: data?.breadcrumbs?.value[data?.breadcrumbs?.value?.length - 1]?.href,
    hours: data?.hours,
    menu: meals,
  };
}

async function saveProgress(
  db: Db,
  uuidList: RestaurantDetail[],
  lastIndex: number
): Promise<void> {
  const collection: Collection<RestaurantDetail> =
    db.collection(OUTPUT_COLLECTION);
  await collection.insertMany(uuidList);
  console.log(`Progress saved up to index: ${lastIndex}`);
}

async function fetchRestaurantDetails(
  restaurantId: string,
  retries = 0
): Promise<any | null> {
  try {
    const response = await axios.post(
      `${BASE_URL}/_p/api/getStoreV1`,
      { storeUuid: restaurantId },
      {
        headers: {
          ...headers,
          Cookie: cookies, // Add the cookies here
        },
      }
    );
    if (response.status === 200) {
      return response.data.data;
    }
    throw new Error(`Unexpected status code: ${response.status}`);
  } catch (err: any) {
    if (retries < MAX_RETRIES) {
      console.warn(
        `Retrying ${restaurantId} (${retries + 1}/${MAX_RETRIES})...`
      );
      return fetchRestaurantDetails(restaurantId, retries + 1);
    }
    console.error(
      `Failed to fetch details for ${restaurantId}: ${err.message}`
    );
    return null;
  }
}
async function processRestaurants(): Promise<void> {
  try {
    const db = await connectToDatabase();
    const restaurantIds = await loadRestaurantIds(db);
    const { data: uuidList, lastIndex: startIndex } = await loadSavedData(db);

    for (let index = startIndex; index < restaurantIds.length; index++) {
      const restaurantId = restaurantIds[index];
      console.log(`Processing ${index + 1}/${restaurantIds.length}`);

      const restaurantDetails = await fetchRestaurantDetails(
        restaurantId || ""
      );
      if (restaurantDetails) {
        const custom = extractMeals(restaurantDetails);
        uuidList.push(custom);

        // Save the progress after each restaurant detail is processed
        await saveProgress(db, [custom], index + 1); // Only save the newly fetched data
      }
    }

    console.log("All restaurants processed successfully!");
  } catch (err: any) {
    console.error(`Error during processing: ${err.message}`);
  }
}

processRestaurants();
