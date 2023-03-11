const fileCardTemplate = document.querySelector("[data-file-template]")
const fileCardContainer = document.querySelector("[data-file-cards-container]")
const searchInput = document.querySelector("[data-search]")

let files = []

// Handle search bar filtering
searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase()
  files.forEach(file => {
    const isVisible = file.name.toLowerCase().includes(value)
    file.element.classList.toggle("hide", !isVisible)
  })
})

// Handle creation of cards using fetch
fetch("/main/files.json")
  .then(res => res.json())
  .then(data => {
    files = data.map(file => {
      const card = fileCardTemplate.content.cloneNode(true).children[0]
      const header = card.querySelector("[data-header]")
      const header_embed = card.querySelector("[data-header-embed]")
      const body = card.querySelector("[data-body]")
      const body_embed = card.querySelector("[data-body-embed]")

      name = file.name;
      limit = 14;
      body.textContent = name.substring(0, limit) + (name.length > limit ? "[...]" : "");
      body_embed.href = file.name;

      fileCardContainer.append(card)
      return { name: file.name, type: file.type, element: card }
    })
  })



const dropZone = document.getElementById('drop-zone');
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');

// Handle dragover event to highlight drop zone when files are dragged over it
dropZone.addEventListener('dragover', (e) => {
	e.preventDefault();
	dropZone.classList.add('dragover');
});

// Handle dragover event to remove highlight when files are dragged out of the drop zone
dropZone.addEventListener('dragleave', (e) => {
	e.preventDefault();
	dropZone.classList.remove('dragover');
});

// Handle drop event to display dropped files
dropZone.addEventListener('drop', (e) => {
	e.preventDefault();
	dropZone.classList.remove('dragover');

	// Get the dropped file from the event data transfer object
	const file = e.dataTransfer.files[0];

	//Create a new form data object
	const formData = new FormData();

	// Loop through the dropped files and add them to the FormData object
	formData.append('file', file)

	console.log(formData);

	// Send POST request
	fetch("/upload", {
		method: "POST",
		body: formData
	})

	// Refresh page
	location.reload()
})



// Handle dark/light theme
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches

document.documentElement.setAttribute('data-theme', (isDark?'dark':'light'))
