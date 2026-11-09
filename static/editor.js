
document.addEventListener("DOMContentLoaded", () => {

    const $ = (id) => document.getElementById(id);

    const canvas = $("canvas");
    const designText = $("designText");

    const controls = {
        text: $("textInput"),
        font: $("fontFamily"),
        size: $("fontSize"),
        weight: $("fontWeight"),
        spacing: $("letterSpacing"),
        color: $("textColor"),
        background: $("bgColor"),
        rotation: $("rotation"),
        animation: $("animation"),
        shadow: $("shadow")
    };

    let alignment = "left";

    function updateDesign() {
        designText.textContent = controls.text.value || " ";

        designText.style.fontFamily = controls.font.value;
        designText.style.fontSize = controls.size.value + "px";
        designText.style.fontWeight = controls.weight.value;
        designText.style.letterSpacing = controls.spacing.value + "px";
        designText.style.color = controls.color.value;
        designText.style.textAlign = alignment;

        designText.style.transform =
            `rotate(${controls.rotation.value}deg)`;

        canvas.style.backgroundColor = controls.background.value;

        designText.classList.remove(
            "anim-float",
            "anim-pulse",
            "anim-shake"
        );

        if (controls.animation.value !== "none") {
            designText.classList.add(
                "anim-" + controls.animation.value
            );
        }

        const shadows = {
            none: "none",
            soft: "0 5px 20px rgba(0,0,0,.35)",
            strong: "0 8px 30px rgba(0,0,0,.8)",
            glow: `0 0 25px ${controls.color.value}`
        };

        designText.style.textShadow =
            shadows[controls.shadow.value];

        $("sizeValue").textContent = controls.size.value + "px";
        $("spacingValue").textContent = controls.spacing.value + "px";
        $("rotateValue").textContent = controls.rotation.value + "°";
    }

    Object.values(controls).forEach(control => {
        control.addEventListener("input", updateDesign);
        control.addEventListener("change", updateDesign);
    });

    document.querySelectorAll(".align-btn").forEach(button => {
        button.addEventListener("click", () => {
            alignment = button.dataset.align;

            document.querySelectorAll(".align-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            updateDesign();
        });
    });

    function getDesign() {
        return {
            text: controls.text.value,
            font: controls.font.value,
            size: controls.size.value,
            weight: controls.weight.value,
            spacing: controls.spacing.value,
            color: controls.color.value,
            background: controls.background.value,
            rotation: controls.rotation.value,
            animation: controls.animation.value,
            shadow: controls.shadow.value,
            alignment: alignment
        };
    }

    function applyDesign(data) {
        controls.text.value = data.text ?? "";
        controls.font.value = data.font ?? "Arial";
        controls.size.value = data.size ?? 80;
        controls.weight.value = data.weight ?? 700;
        controls.spacing.value = data.spacing ?? 0;
        controls.color.value = data.color ?? "#ffffff";
        controls.background.value = data.background ?? "#171717";
        controls.rotation.value = data.rotation ?? 0;
        controls.animation.value = data.animation ?? "none";
        controls.shadow.value = data.shadow ?? "none";

        alignment = data.alignment ?? "left";

        document.querySelectorAll(".align-btn").forEach(btn => {
            btn.classList.toggle(
                "active",
                btn.dataset.align === alignment
            );
        });

        updateDesign();
    }

    function getWorks() {
        try {
            return JSON.parse(localStorage.getItem("typeLabWorks")) || [];
        } catch {
            return [];
        }
    }

    function saveWorks(works) {
        localStorage.setItem("typeLabWorks", JSON.stringify(works));
    }

    function renderWorks() {
        const worksList = $("worksList");
        const works = getWorks();

        worksList.innerHTML = "";

        if (works.length === 0) {
            worksList.innerHTML =
                '<p class="works-description">No saved projects yet.</p>';
            return;
        }

        works.forEach((work, index) => {
            const item = document.createElement("div");
            item.className = "work-item";

            const title = document.createElement("strong");
            title.textContent = work.text || "Untitled Design";

            const actions = document.createElement("div");
            actions.className = "work-actions";

            const loadButton = document.createElement("button");
            loadButton.textContent = "OPEN";
            loadButton.addEventListener("click", () => {
                applyDesign(work);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "DELETE";
            deleteButton.addEventListener("click", () => {
                const updated = getWorks();
                updated.splice(index, 1);
                saveWorks(updated);
                renderWorks();
            });

            actions.append(loadButton, deleteButton);
            item.append(title, actions);
            worksList.appendChild(item);
        });
    }

    $("saveBtn").addEventListener("click", () => {
        const works = getWorks();
        works.unshift(getDesign());

        saveWorks(works.slice(0, 30));
        renderWorks();

        alert("Your design has been saved!");
    });

    $("resetBtn").addEventListener("click", () => {
        applyDesign({
            text: "TYPE IS ART.",
            font: "Arial",
            size: 80,
            weight: 700,
            spacing: 0,
            color: "#ffffff",
            background: "#171717",
            rotation: 0,
            animation: "none",
            shadow: "none",
            alignment: "left"
        });
    });

    $("downloadBtn").addEventListener("click", async () => {
        if (typeof html2canvas === "undefined") {
            alert("이미지 저장 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
            return;
        }

        try {
            const button = $("downloadBtn");
            button.textContent = "EXPORTING...";

            const oldAnimation = designText.className;
            designText.className = "";

            const result = await html2canvas(canvas, {
                scale: 2,
                backgroundColor: null,
                useCORS: true
            });

            designText.className = oldAnimation;

            const link = document.createElement("a");
            link.download = "type-lab-design.png";
            link.href = result.toDataURL("image/png");
            link.click();

            button.textContent = "DOWNLOAD PNG ↗";

        } catch (error) {
            designText.className = "";
            updateDesign();
            alert("이미지 저장에 실패했습니다. 다시 시도해 주세요.");
            $("downloadBtn").textContent = "DOWNLOAD PNG ↗";
        }
    });

    updateDesign();
    renderWorks();

});
