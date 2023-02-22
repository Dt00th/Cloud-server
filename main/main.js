const fileCardTemplate = document.querySelector("[data-file-template]")
const fileCardContainer = document.querySelector("[data-file-cards-container]")
const searchInput = document.querySelector("[data-search]")

let files = []

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
      return { name: file.name, type : file.type, element: card }
    })
  })

searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase()
  files.forEach(file => {
    console.log(file)
    const isVisible = file.name.toLowerCase().includes(value)
    file.element.classList.toggle("hide", !isVisible)
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
dropZone.addEventListener('dragleave', () => {
	e.preventDefault();
	dropZone.classList.remove('dragover');
});

// Handle drop event to display dropped files
dropZone.addEventListener('drop', async (e) => {
	e.preventDefault();
	dropZone.classList.remove('dragover');

	console.log(e)

	const formData = new FormData();

	// Loop through the dropped files and add them to the FormData object
	for (const file of e.dataTransfer.files) {
		formData.append('files', file);
	}

	// Send a fetch POST request to the server with the FormData object

	// Refresh the page to display the new files
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "fuck you, bitch"}, function(response) {
			alert(response)
		})
	})
	location.reload()
});
