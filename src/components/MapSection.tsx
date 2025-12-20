import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"


// حل متوافق مع Vite/ESM لاستيراد صور أيقونات leaflet
const markerIcon2x = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
const markerIcon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const markerShadow = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

// Fix default marker icons for bundlers (Vite)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export default function MapSection({ lat = 17.253845, lng = 42.616934 }: { lat?: number; lng?: number }) {
  return (
    <section id="location" className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold mb-4 text-right">موقع المنتجع</h3>
        <p className="text-gray-600 text-right mb-6">العنوان التقريبي — يمكنك تكبير الخريطة للتفاصيل أو فتح Google Maps.</p>

        <div className="w-full h-[400px] rounded-xl overflow-hidden border">
          <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>
                Moon Garden — المنتجع
                <br />
                <a
                  className="text-sm underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  افتح في Google Maps
                </a>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </section>
  )
}
