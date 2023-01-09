
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





document.querySelectorAll(".drop-zone__input").forEach(inputElement => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", e=>{
        inputElement.click();
    });

    dropZoneElement.addEventListener("dragover", e => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach(type => {
        dropZoneElement.addEventListener(type, e => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", e => {
        e.preventDefault();
        dropZoneElement.submit();


        if(e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
        }



        dropZoneElement.classList.remove("drop-zone--over");
    });
});