import { useState } from "react";

export default function ToolPage() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productionDate, setProductionDate] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [productionCompany, setProductionCompany] = useState("");
  const [country, setCountry] = useState("");
  const [composition, setComposition] = useState("");
  const [reusable, setReusable] = useState(false);
  const [usageCount, setUsageCount] = useState("");
  const [photos, setPhotos] = useState([]); // Массив файлов

  const [photoPreviews, setPhotoPreviews] = useState([]); // Массив URL для превью
  const [zipUrl, setZipUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);

    e.target.value = null;
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);

    if (newPhotos.length === 0) {
      setPhotoPreviews([]);
    } else {
      const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));
      setPhotoPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setZipUrl(null);

    const formData = new FormData();

    // Добавляем все поля как form-data
    formData.append("name", name);
    formData.append("productionDate", productionDate);
    formData.append("acceptanceDate", acceptanceDate);
    formData.append("productionCompany", productionCompany);
    formData.append("country", country);
    formData.append("composition", composition);
    formData.append("reusable", reusable.toString()); // boolean → string
    formData.append("usageCount", usageCount === "" ? "0" : usageCount.toString());
    formData.append("quantity", quantity === "" ? "0" : quantity.toString());

    // Добавляем файлы
    photos.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("http://localhost:8080/api/instruments/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Ошибка при отправке данных");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setZipUrl(url);
    } catch (err) {
      console.error(err);
      alert("Произошла ошибка при создании инструмента");
    } finally {
      setLoading(false);
    }
    // for (let pair of formData.entries()) {
    //   console.log(pair[0], pair[1]);
    // }
    console.log(new Date().toISOString().slice(0, 10));
    console.log(productionDate, acceptanceDate)
  };


  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Добавление инструмента</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <label>
          Название:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>

        <label>
          Дата производства:
          <input
            type="date"
            value={productionDate}
            onChange={(e) => setProductionDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>

        <label>
          Дата приёмки:
          <input
            type="date"
            value={acceptanceDate}
            onChange={(e) => setAcceptanceDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>

        <label>
          Компания-производитель:
          <input
            type="text"
            value={productionCompany}
            onChange={(e) => setProductionCompany(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>

        <label>
          Страна:
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>

        <label>
          Состав:
          <input
            type="text"
            value={composition}
            onChange={(e) => setComposition(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>

        <label>
          Многоразовый:
          <input
            type="checkbox"
            checked={reusable}
            onChange={(e) => setReusable(e.target.checked)}
            style={{ marginLeft: "10px" }}
          />
        </label>

        {reusable && (
          <label>
            Количество использований:
            <input
              type="number"
              value={usageCount}
              onChange={(e) => setUsageCount(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </label>
        )}

        <label>
          Количество экземпляров:
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = e.target.value;
              setQuantity(val === "" ? "" : Number(val));
            }}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </label>

        <label>
          Фотографии:
          <label style={{ display: "inline-block", position: "relative", cursor: "pointer", marginTop: "5px", marginLeft: "10px" }}>
            <span
              style={{
                padding: "8px 12px",
                background: "#007bff",
                color: "white",
                borderRadius: "5px",
                display: "inline-block",
              }}
            >
              Выбрать файлы
            </span>
            <input
              type="file"
              multiple
              onChange={handlePhotoChange}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </label>
        </label>

        {/* Предпросмотр фотографий */}

        {photoPreviews.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
            {photoPreviews.map((src, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}


        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 15px",
            background: loading ? "#aaa" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Создание..." : "Создать инструмент"}
        </button>
      </form>

      {zipUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Инструмент создан!</h3>
          <a
            href={zipUrl}
            download="barcodes.zip"
            style={{
              display: "inline-block",
              padding: "10px 15px",
              background: "green",
              color: "white",
              borderRadius: "5px",
              textDecoration: "none",
            }}
          >
            📦 Скачать штрих-коды (ZIP)
          </a>
        </div>
      )}
    </div>
  );
}
