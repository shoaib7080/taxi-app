export const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || "";

const BASE_URL = "https://maps.googleapis.com/maps/api";

type Location = {
  latitude: number;
  longitude: number;
};

// 1. SEARCH PLACES (Autocomplete)
export const searchPlaces = async (query: string) => {
  if (query.length < 3) return [];

  try {
    const url = `${BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}&components=country:ae`;

    const response = await fetch(url);
    const data = await response.json();
    return data.predictions || [];
  } catch (error) {
    console.error("Google Places Search Error:", error);
    return [];
  }
};

// 2. GET PLACE DETAILS (Coordinates)
export const fetchPlaceDetails = async (placeId: string) => {
  try {
    const url = `${BASE_URL}/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const location = data.result.geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error) {
    console.error("Google Place Details Error:", error);
    return null;
  }
};

// 3. GET DIRECTIONS (Polyline)
export const fetchDirections = async (start: Location, end: Location) => {
  try {
    const url = `${BASE_URL}/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes.length) {
      return {
        points: decodePolyline(data.routes[0].overview_polyline.points),
        duration: data.routes[0].legs[0].duration.text,
        distance: data.routes[0].legs[0].distance.text,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Directions Error:", error);
    return null;
  }
};

// 4. REVERSE GEOCODE (Coordinate -> Address)
// 4. REVERSE GEOCODE (Coordinate -> Address)
export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const url = `${BASE_URL}/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length > 0) {
      const result = data.results[0];
      const components = result.address_components;

      // Extract City (Locality or Administrative Area)
      let city = "Unknown City";
      const locality = components.find((c: any) =>
        c.types.includes("locality")
      );
      const adminArea = components.find((c: any) =>
        c.types.includes("administrative_area_level_1")
      );

      if (locality) {
        city = locality.short_name;
      } else if (adminArea) {
        city = adminArea.short_name;
      }

      return {
        name: result.address_components[0].short_name, // e.g. "Dubai Mall" or "Street 1"
        desc: result.formatted_address, // Full address
        city: city,
      };
    }
    return {
      name: "Pinned Location",
      desc: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: "Unknown City",
    };
  } catch (error) {
    console.error("Reverse Geocode Error:", error);
    return { name: "Pinned Location", desc: "Unknown Address", city: "Error" };
  }
};

// Helper: Decode Google's Polyline String
function decodePolyline(t: string) {
  let points = [];
  let index = 0,
    len = t.length;
  let lat = 0,
    lng = 0;
  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = t.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = t.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}
