document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const lista = document.getElementById("lista");

  async function laduj() {
    const res = await fetch("/ksiazki");
    const dane = await res.json();
    lista.innerHTML = "";

    dane.forEach(k => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${k.id}</td>
        <td>${k.tytul}</td>
        <td>${k.imie_autora || ""}</td>
        <td>${k.nazwisko_autora || ""}</td>
        <td>${k.rok_wydania || ""}</td>
        <td>${k.wydawnictwo || ""}</td>
        <td>${k.cena || ""}</td>
        <td>${new Date(k.data_dodania).toLocaleString()}</td>
        <td>
          <button type="button" class="edit" data-id="${k.id}">✏️</button>
          <button type="button" class="delete" data-id="${k.id}">🗑️</button>
        </td>`;
      lista.appendChild(tr);
    });

    document.querySelectorAll(".edit").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const ksiazka = await fetch(`/ksiazki/${id}`).then(r => r.json());
        document.getElementById("id").value = ksiazka.id;
        document.getElementById("tytul").value = ksiazka.tytul;
        document.getElementById("imie_autora").value = ksiazka.imie_autora || "";
        document.getElementById("nazwisko_autora").value = ksiazka.nazwisko_autora || "";
        document.getElementById("rok").value = ksiazka.rok_wydania || "";
        document.getElementById("wydawnictwo").value = ksiazka.wydawnictwo || "";
        document.getElementById("cena").value = ksiazka.cena || "";
      });
    });

    document.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (confirm("Na pewno usunąć?")) {
          await fetch(`/ksiazki/${id}`, { method: "DELETE" });
          await laduj();
        }
      });
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("id").value;
    const tytul = document.getElementById("tytul").value;
    const imie_autora = document.getElementById("imie_autora").value;
    const nazwisko_autora = document.getElementById("nazwisko_autora").value;
    const rok = document.getElementById("rok").value;
    const wydawnictwo = document.getElementById("wydawnictwo").value;
    const cena = document.getElementById("cena").value;
    const dane = { tytul, imie_autora, nazwisko_autora, rok_wydania: rok ? parseInt(rok) : null, wydawnictwo , cena};

    const metoda = id ? "PUT" : "POST";
    const url = id ? `/ksiazki/${id}` : "/ksiazki";

    await fetch(url, {
      method: metoda,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dane)
    });

    // Po zapisie wyczyść formularz i wróć do trybu dodawania
    form.reset();
    document.getElementById("id").value = "";

    await laduj();
  });

  laduj();
});
