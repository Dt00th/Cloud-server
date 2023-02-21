const fileCardTemplate = document.querySelector("[data-file-template]")
const fileCardContainer = document.querySelector("[data-file-cards-container]")
const searchInput = document.querySelector("[data-search]")

let files = []

searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase()
  files.forEach(file => {
    const isVisible = file.name.toLowerCase().includes(value)
    file.element.classList.toggle("hide", !isVisible)
  })
})

fetch("/main/files.json")
  .then(res => res.json())
  .then(data => {
    files = data.map(file => {
      const card = fileCardTemplate.content.cloneNode(true).children[0]
      const header = card.querySelector("[data-header]")
      const header_embed = card.querySelector("[data-header-embed]")
      const body = card.querySelector("[data-body]")
      const body_embed = card.querySelector("[data-body-embed]")

      body.textContent = file.name
      body_embed.href = "/files/" + file.name
      
      fileCardContainer.append(card)
      return { name: file, element: card }
    })
  })


//fs.readdir('files/', (err, files) => {
//    fileList = files.map(file => {
//        const card = fileCardTemplate.content.cloneNode(true).children[0];
//        const header = card.querySelector("[data-header]");
//        const body = card.querySelector("[data-body]");
//        header.textContent = file.name
//        body.textContent= file.name;
//        fileCardContainer.append(card);
//        return {name : file.name, element: card};
//    });
//});





//document.querySelectorAll(".drop-zone__input").forEach(inputElement => {
//    const dropZoneElement = inputElement.closest(".drop-zone");
//
//	dropZoneElement.addEventListener("click", e=>{
//        inputElement.click();
//    });
//
//	dropZoneElement.addEventListener("dragover", e => {
//      e.preventDefault();
//      dropZoneElement.classList.add("drop-zone--over");
//    });
//
//    ["dragleave", "dragend"].forEach(type => {
//        dropZoneElement.addEventListener(type, e => {
//            dropZoneElement.classList.remove("drop-zone--over");
//        });
//    });
//
//    dropZoneElement.addEventListener("drop", e => {
//        e.preventDefault();
//        dropZoneElement.submit();
//
//
//        if(e.dataTransfer.files.length) {
//            inputElement.files = e.dataTransfer.files;
//        }
//
//
//
//        dropZoneElement.classList.remove("drop-zone--over");
//    });
//});

const dropZone = document.getElemntById('drop-zone');

// Handle dragover event to highlight drop zone when files are dragged over it
dropZone.addEventListener('dragover', (e) => {
	e.preventDefault();
	dropZone.classList.add('dragover');
});

// Handle dragover event to remove highlight when files are dragged out of the drop zone
dropZone.addEventListener('dragleave', () => {
	dropZone.classList.remove('dragover');
});

// Handler drop event to display dropped files
dropZone.addEventListener('drop', (e) => {
	e.preventDefault();
	dropZone.classList.remove('dragover');

	// Create a new FormData object to store the dropped files
	const files = Array.from(e.dataTransfer.files);
	files.forEach((file) => {
		formData.append('files', file);
	});

	// Send a fetch POST request to the server with the FormData object
	const response = await fetch('/upload', {
		method: 'POST',
		body: formData
	});
	const data = await response.json();
	console.log(data);
});
