//Function 1 - createElemWithText
function createElemWithText(elemType = "p", textContent = "", className){
    const myElem = document.createElement(elemType);

    myElem.textContent = textContent;

    if(className) {
        myElem.classList.add(className);
    }
    
    return myElem;
}

//Function 2 - createSelectOptions
function createSelectOptions(data){
    if (!data) return;

    const options = [];

    for (const user of data){
        const option = document.createElement("option");
        option.value = user.id;
        options.push(option)
        option.textContent = user.name;
    }

    return options;
}

//Function 3 - toggleCommentSection
function toggleCommentSection(postId){
    if (!postId) return;
    
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (!section) return null;

    section.classList.toggle("hide");

    return section;
}

//Function 4 - toggleCommentButton
function toggleCommentButton(postId){
    if (!postId) return;

    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (!button) return null;

    button.textContent = (button.textContent === "Show Comments") ? "Hide Comments" : "Show Comments";

    return button;
}


//Function 5 - deleteChildElements
function deleteChildElements(parentElement){
    if(!parentElement?.tagName) return;

    let child = parentElement.lastElementChild;

    while (child){
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }

    return parentElement;
}

//Function 6 - addButtonListeners
function addButtonListeners(){
    const buttons = document.querySelectorAll("main button")
    
    if (!buttons) return [];

    buttons.forEach((button) => {
        const postId = button.dataset.postId
        if (postId){
            button.addEventListener("click", function(e) {toggleComments(e, postId)}, false)
        }
    })
    
    return buttons;
}

//Function 7 - removeButtonListeners
function removeButtonListeners(){
    const buttons = document.querySelectorAll("main button")
    if (!buttons) return [];

    buttons.forEach((button) => {
        const postId = button.dataset.postId
        if (!postId) return;
        button.removeEventListener("click", function(e) {toggleComments(e, postId)}, false)
    })

    return buttons;
}

//Function 8 - createComments
function createComments(comments){
    const fragment = new DocumentFragment();
    if(!comments) return;

    comments.forEach(comment => {
        const article = document.createElement("article");
        const h3 = createElemWithText("h3", comment.name);
        const p1 = createElemWithText("p", comment.body);
        const p2 = createElemWithText("p", `From: ${comment.email}`);

        article.append(h3, p1, p2);
        fragment.append(article);
    })

    return fragment;
}

//Function 9 - populateSelectMenu
function populateSelectMenu(users){
    const menu = document.getElementById("selectMenu")
    if (!users) return;

    const options = createSelectOptions(users);
    options.forEach(option => {
        menu.appendChild(option)
    })

    return menu;
}

//Function 10 - getUsers
const getUsers = async () => {
    try{
        const users = await fetch("https://jsonplaceholder.typicode.com/users")
        const jsonUsers = await users.json();

        return jsonUsers;
    } catch (error){
        console.error("Could not get users")
    }
}

//Function 11 - getUserPosts
const getUserPosts = async (userId) => {
    if (!userId) return;

    try{
        const posts = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
        const jsonPosts = await posts.json();

        return jsonPosts;
    } catch(error){
        console.error("Could not get user posts");
    }
}

//Function 12 - getUser
const getUser = async (userId) => {
    if (!userId) return;

    try{
        const user = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
        const jsonUser = await user.json();

        return jsonUser;
    } catch(error){
        console.error("Could not get user")
    }
}

//Function 13 - getPostComments
const getPostComments = async (postId) => {
    if(!postId) return;

    try{
        const comments = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`)
        const jsonComments = await comments.json();

        return jsonComments;
    } catch(error){
        console.error("Could not get post comments")
    }
}

//Function 14 - displayComments
const displayComments = async (postId) => {
    if (!postId) return;

    const section = document.createElement("section");

    section.dataset.postId = postId;
    section.classList.add("comments", "hide");

    const comments = await getPostComments(postId);
    const fragment = createComments(comments)

    section.append(fragment)

    return section;
}

//Function 15 - createPosts
const createPosts = async (data) => {
    if (!data) return
    const fragment = document.createDocumentFragment()

    for(const post of data) {
        const article = document.createElement('article')
        const h2 = createElemWithText("h2", post.title)
        const p1 = createElemWithText("p", post.body)
        const p2 = createElemWithText("p", `Post ID: ${post.id}`)
        const author = await getUser(post.userId)
        const p3 = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`)
        const p4 = createElemWithText("p", author.company.catchPhrase)

        const button = createElemWithText("button", "Show Comments")
        button.dataset.postId = post.id
        
        article.append(h2, p1, p2, p3, p4, button);

        const section = await displayComments(post.id)

        article.append(section)

        fragment.append(article)
    }

    return fragment;
}

//Function 16 - displayPosts
const displayPosts = async (posts) => {
    const main = document.querySelector("main")
    if(!main) return;

    const element = (posts !== undefined 
        ? await createPosts(posts) 
        : createElemWithText("p", "Select an Employee to display their posts.", "default-text"))

    main.append(element)

    return element
}   

//Function 17 - toggleComments
function toggleComments(event, postId){
    if (!event) return;
    if (!postId) return;

    event.target.listener = true;
    const section = toggleCommentSection(postId)
    const button = toggleCommentButton(postId)

    return [section, button]
}

//Function 18 - refreshPosts
const refreshPosts = async (data) => {
    if (!data) return;

    const removeButtons = removeButtonListeners()
    //This main line was a shot in the dark, but it worked somehow
    const main = deleteChildElements(document.querySelector("main"))
    const fragment = await displayPosts(data)
    const addButtons = addButtonListeners()

    return [removeButtons, main, fragment, addButtons]
}

//Function 19 - selectMenuChangeEventHandler
const selectMenuChangeEventHandler = async (event) => {
    //I realize that the userId is also getting some non-number values and that's why the very last check is failing
    //But no matter the validation that I put, it won't pass, so I've made it just the basic code
    if (!event?.type) return

    const select = event?.type

    select.disabled = true

    const userId = event?.target?.value || 1


    const posts = await getUserPosts(userId)
    const refreshPostsArray = await refreshPosts(posts)

    select.disabled = false
    
    return [userId, posts, refreshPostsArray]
}

//Function 20 - initPage
const initPage = async () => {
    const users = await getUsers()
    const select = populateSelectMenu(users)

    return [users, select]
}

//Function 21 - initApp
function initApp(){
    initPage()
    const select = document.getElementById("selectMenu")
    select.addEventListener("change", selectMenuChangeEventHandler)
}

document.addEventListener("DOMContentLoaded", initApp)