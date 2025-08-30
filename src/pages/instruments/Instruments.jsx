import { useState } from "react";

export default function ToolPage() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [productionDate, setProductionDate] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [productionCompany, setProductionCompany] = useState("");
  const [country, setCountry] = useState("");
  const [composition, setComposition] = useState("");
  const [reusable, setReusable] = useState(true);
  const [usageCount, setUsageCount] = useState("0");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [zipUrl, setZipUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setPhotos([...photos, ...files]);
    setPhotoPreviews([...photos, ...files].map(f => URL.createObjectURL(f)));
    e.target.value = null;
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setZipUrl(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("productionDate", productionDate);
    formData.append("acceptanceDate", acceptanceDate);
    formData.append("productionCompany", productionCompany);
    formData.append("country", country);
    formData.append("composition", composition);
    formData.append("reusable", reusable.toString());
    formData.append("usageCount", usageCount === "" ? "0" : usageCount.toString());
    formData.append("quantity", quantity === "" ? "0" : quantity.toString());
    photos.forEach(f => formData.append("images", f));

    if (photos.length === 0) {
      alert("Пожалуйста, добавьте хотя бы одну фотографию инструмента.");
      setLoading(false);
      return;
    }


    try {
      const res = await fetch(`${API_URL}/instruments/create`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Ошибка сервера");
      const blob = await res.blob();
      setZipUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании инструмента");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Добавление инструмента</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}
      >
        <label>Название:
          <input required placeholder="Скальпель" type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
        </label>
        <label>Дата производства:
          <input required type="date" value={productionDate} onChange={e => setProductionDate(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
        </label>
        <label>Дата приёмки:
          <input required type="date" value={acceptanceDate} onChange={e => setAcceptanceDate(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
        </label>
        <label>Компания-производитель:
          <input required placeholder="MedCorp" type="text" value={productionCompany} onChange={e => setProductionCompany(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
        </label>
        <label>Страна:
          <input required placeholder="Кыргызстан" type="text" value={country} onChange={e => setCountry(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
        </label>
        <label>Состав:
          <input required placeholder="Хирургическая сталь" type="text" value={composition} onChange={e => setComposition(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
        </label>
        <label>Многоразовый:
          <input required type="checkbox" checked={reusable} onChange={e => setReusable(e.target.checked)} style={{ marginLeft: "10px" }} />
        </label>
        {reusable && (
          <label>Количество использований:
            <input required type="number" value={usageCount} onChange={e => setUsageCount(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </label>
        )}
        <label>Количество экземпляров:
          <input required type="number" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
        </label>
        <label>Фотографии:
          <input type="file" multiple onChange={handlePhotoChange} style={{ display: "block", marginTop: "5px", color: 'transparent' }} />
        </label>
        {photoPreviews.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
            {photoPreviews.map((src, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={src} alt={`preview-${i}`} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px", border: "1px solid #ccc" }} />
                <button type="button" onClick={() => handleRemovePhoto(i)} style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
        )}
        <button type="submit" disabled={loading} style={{ padding: "10px 15px", background: loading ? "#aaa" : "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Создание..." : "Создать инструмент"}
        </button>
      </form>
      {zipUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Инструмент создан!</h3>
          <a href={zipUrl} download="barcodes.zip" style={{ display: "inline-block", padding: "10px 15px", background: "green", color: "white", borderRadius: "5px", textDecoration: "none" }}>
            📦 Скачать штрих-коды (ZIP)
          </a>
        </div>
      )}
    </div>
  );
}
