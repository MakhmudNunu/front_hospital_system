import React, { useState } from "react";

export default function CreateBox() {
  const [name, setName] = useState("");
  const [doctor, setDoctor] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const removeBarcode = (index) => {
    setBarcodes(barcodes.filter((_, i) => i !== index));
  };

  const handleAddBarcode = async () => {
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      const res = await fetch(`http://localhost:8080/api/instruments/${code}`);
      if (!res.ok) {
        alert(`Инструмент с баркодом ${code} не найден!`);
        return;
      }
      const instrument = await res.json();
      setBarcodes([...barcodes, { barcode: code, ...instrument }]);
      setBarcodeInput("");
    } catch (err) {
      console.error(err);
      alert("Ошибка при поиске инструмента");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "name",
        name ? `${name}_${new Date().toISOString().slice(0, 10)}` : "Box_" + Date.now()
      );
      formData.append("doctorName", doctor);
      formData.append("returnDate", returnDate);
      barcodes.forEach(b => formData.append("instrumentBarcodes", b.barcode));

      const res = await fetch("http://localhost:8080/api/boxes/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Ошибка сервера:", res);
        alert("Ошибка при создании бокса. Проверьте данные.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `box_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("Бокс успешно создан и PDF скачан!");
    } catch (err) {
      console.error(err);
      alert("Произошла ошибка при создании бокса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Создание бокса</h1>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <label>
            Название бокса:
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="имя-доктора_тип-операции"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </label>

          <label>
            Имя доктора:
            <input
              type="text"
              value={doctor}
              onChange={e => setDoctor(e.target.value)}
              placeholder="Введите имя доктора"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </label>

          <label>
            Дата возврата:
            <input
              type="date"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </label>

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
            {loading ? "Создание..." : "Создать бокс"}
          </button>
        </form>

        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <label>
            Сканируйте штрих-код инструмента:
            <input
              type="text"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddBarcode();
                }
              }}
              placeholder="Поднесите сканер и отсканируйте"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </label>

          {barcodes.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "15px" }}>
              {barcodes.map((instrument, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "10px",
                    gap: "10px",
                  }}
                >
                  {instrument.images &&
                    instrument.images.length > 0 &&
                    instrument.images[0].url && (
                      <img
                        src={instrument.images[0].url}
                        alt={instrument.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    )}
                  <div style={{ flex: 1 }}>
                    <strong>{instrument.name || "Без названия"}</strong>
                    <br />
                    <small>Штрихкод: {instrument.barcode}</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBarcode(index)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
