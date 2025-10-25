import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, } from "firebase/firestore";
import { db, storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
export default function AdminVillas() {
    const [villas, setVillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingVilla, setEditingVilla] = useState(null);
    const [newImage, setNewImage] = useState(null);
    useEffect(() => {
        const fetchVillas = async () => {
            const snap = await getDocs(collection(db, "villas"));
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setVillas(data);
            setLoading(false);
        };
        fetchVillas();
    }, []);
    const handleAdd = async () => {
        const name = prompt("اسم الفيلا:");
        if (!name)
            return;
        const price = Number(prompt("السعر بالريال:") || 0);
        await addDoc(collection(db, "villas"), {
            name,
            price,
            status: "متاح",
            image: "",
            description: "",
        });
        alert("✅ تمت إضافة الفيلا بنجاح");
        window.location.reload();
    };
    const handleDelete = async (id) => {
        if (confirm("هل أنت متأكد من حذف هذه الفيلا؟")) {
            await deleteDoc(doc(db, "villas", id));
            setVillas(villas.filter((v) => v.id !== id));
            alert("🗑️ تم حذف الفيلا بنجاح");
        }
    };
    const handleSave = async () => {
        if (!editingVilla)
            return;
        let imageUrl = editingVilla.image;
        if (newImage) {
            const imageRef = ref(storage, `villas/${editingVilla.id}-${newImage.name}`);
            await uploadBytes(imageRef, newImage);
            imageUrl = await getDownloadURL(imageRef);
        }
        await updateDoc(doc(db, "villas", editingVilla.id), {
            name: editingVilla.name,
            price: Number(editingVilla.price),
            status: editingVilla.status,
            description: editingVilla.description || "",
            image: imageUrl,
        });
        alert("✅ تم حفظ التعديلات بنجاح");
        setEditingVilla(null);
        setNewImage(null);
        window.location.reload();
    };
    if (loading)
        return _jsx("p", { className: "text-center", children: "\u23F3 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A..." });
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen text-right", children: [_jsxs("div", { className: "flex justify-between mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0644\u0644 \u0648\u0627\u0644\u0623\u062C\u0646\u062D\u0629" }), _jsx("button", { onClick: handleAdd, className: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700", children: "\u2795 \u0625\u0636\u0627\u0641\u0629 \u0641\u064A\u0644\u0627" })] }), _jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: villas.map((villa) => (_jsxs("div", { className: "bg-white shadow rounded-lg p-4 border hover:shadow-lg transition", children: [_jsx("img", { src: villa.image || "/placeholder.png", alt: villa.name, className: "w-full h-48 object-cover rounded mb-3" }), _jsx("h3", { className: "font-bold text-lg mb-1", children: villa.name }), _jsxs("p", { className: "text-gray-600 mb-1", children: ["\uD83D\uDCB0 ", villa.price, " \u0631\u064A\u0627\u0644"] }), _jsxs("p", { className: "text-gray-600 mb-3", children: ["\uD83D\uDCE6 ", villa.status] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { onClick: () => setEditingVilla(villa), className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", children: "\u062A\u0639\u062F\u064A\u0644" }), _jsx("button", { onClick: () => handleDelete(villa.id), className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700", children: "\u062D\u0630\u0641" })] })] }, villa.id))) }), editingVilla && (_jsx("div", { className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-right", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "\u270F\uFE0F \u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0641\u064A\u0644\u0627" }), _jsx("label", { className: "block mb-2", children: "\u0627\u0633\u0645 \u0627\u0644\u0641\u064A\u0644\u0627:" }), _jsx("input", { value: editingVilla.name, onChange: (e) => setEditingVilla({ ...editingVilla, name: e.target.value }), className: "border w-full p-2 rounded mb-3" }), _jsx("label", { className: "block mb-2", children: "\u0627\u0644\u0633\u0639\u0631:" }), _jsx("input", { type: "number", value: editingVilla.price, onChange: (e) => setEditingVilla({ ...editingVilla, price: e.target.value }), className: "border w-full p-2 rounded mb-3" }), _jsx("label", { className: "block mb-2", children: "\u0627\u0644\u062D\u0627\u0644\u0629:" }), _jsxs("select", { value: editingVilla.status, onChange: (e) => setEditingVilla({ ...editingVilla, status: e.target.value }), className: "border w-full p-2 rounded mb-3", children: [_jsx("option", { value: "\u0645\u062A\u0627\u062D", children: "\u0645\u062A\u0627\u062D" }), _jsx("option", { value: "\u0645\u062D\u062C\u0648\u0632", children: "\u0645\u062D\u062C\u0648\u0632" }), _jsx("option", { value: "\u0645\u0624\u0643\u062F", children: "\u0645\u0624\u0643\u062F" })] }), _jsx("label", { className: "block mb-2", children: "\u0627\u0644\u0648\u0635\u0641:" }), _jsx("textarea", { value: editingVilla.description || "", onChange: (e) => setEditingVilla({ ...editingVilla, description: e.target.value }), className: "border w-full p-2 rounded mb-3" }), _jsx("label", { className: "block mb-2", children: "\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0635\u0648\u0631\u0629:" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => setNewImage(e.target.files?.[0] || null), className: "mb-4" }), _jsxs("div", { className: "flex justify-between", children: [_jsx("button", { onClick: handleSave, className: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700", children: "\uD83D\uDCBE \u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A" }), _jsx("button", { onClick: () => setEditingVilla(null), className: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500", children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) }))] }));
}
