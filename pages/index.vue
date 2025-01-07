<template>
  <div>
    <div v-if="submitted" style="display: flex; align-items: center; justify-content: center; flex-direction: column; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
      <h1 style="margin: 0;">Vielen Dank!</h1>
      <p style="margin: 0;">Ihre Daten wurden erfolgreich übermittelt.</p>
      <button @click="initPage" style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; background-color: #4caf50; color: white; border-radius: 0.25rem; cursor: pointer;">Erneut ausfüllen</button>
    </div>
    <div v-else>
      <div ref="viewerContainer" class="container">
        <div ref="viewerElement">Wird geladen...</div>
      </div>
      <button @click="onSubmit" class="save">{{loading ? "Bitte warten..." : "Absenden"}}</button>
      <button @click="onDownload" class="download">Herunterladen</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "pdfjs-dist/web/pdf_viewer.css";
import type { PDFViewer } from "pdfjs-dist/web/pdf_viewer";


const viewerContainer = ref<HTMLDivElement | null>(null);
const viewerElement = ref<HTMLDivElement | null>(null);
const loading = ref(false);
const submitted = ref(false);

let viewer: PDFViewer | null = null;

async function initPage() {
  submitted.value = false;
  loading.value = false;
  const pdfJsLib = await import("pdfjs-dist");
  const pdfJs = await import("pdfjs-dist/web/pdf_viewer");
  pdfJsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  const eventBus = new pdfJs.EventBus();
  const linkService = new pdfJs.PDFLinkService({
    eventBus,
  });
  const l10n = new pdfJs.GenericL10n("");
  viewer = new pdfJs.PDFViewer({
    container: viewerContainer.value!,
    viewer: viewerElement.value!,
    eventBus,
    linkService,
    l10n,
    annotationMode: pdfJsLib.AnnotationMode.ENABLE_FORMS,
  });
  linkService.setViewer(viewer);
  const pdf = await pdfJsLib.getDocument("/formular.pdf").promise;
  viewer.setDocument(pdf);
};

onMounted(initPage);

async function onSubmit() {
  loading.value = true;
  const pdf = await viewer!.pdfDocument?.saveDocument()!;
  const base64pdf = btoa(
    pdf.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  // Info:
  // 8R and 5R are the internal IDs of the fields that contain the first and last name respectively
  // These depend on the PDF document and need to be adjusted accordingly if the PDF is replaced
  
  // @ts-expect-error This is badly typed in the PDF.js typings, but is correct
  let firstName = viewer!.pdfDocument!.annotationStorage.getValue("8R", "Vorname").value as string;
  // @ts-expect-error This is badly typed
  let lastName = viewer!.pdfDocument!.annotationStorage.getValue("5R", "Nachname").value as string;
  await $fetch("/api/upload", {
    method: "POST",
    body: {
      data: base64pdf,
      filename: `Anmeldung ${firstName} ${lastName}.pdf`
    },
  });
  submitted.value = true;
}

async function onDownload() {
  const pdf = await viewer!.pdfDocument?.saveDocument()!;
  const base64pdf = btoa(
    pdf.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64pdf}`;
  link.download = "Anmeldung IKGP.pdf";
  link.click();
}
</script>

<style>
.container {
  position: absolute;
  overflow: auto;
  top: 1.5rem;
  bottom: 1.5rem;
  margin-left: auto;
  margin-right: auto;
  left: 50%;
  transform: translateX(-50%);
  overflow-x: hidden;
}

.page {
  position: relative;
}

button.save {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
}

button.download {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
}

input[type="text"],
textarea {
  appearance: none;
  background: white !important;
  border: none !important;
  outline: none !important;
}
</style>
