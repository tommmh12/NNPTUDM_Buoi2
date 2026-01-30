async function GetData() {
    try {
        let res = await fetch('http://localhost:3000/posts')
        if (res.ok) {
            let posts = await res.json();
            let bodyTable = document.getElementById('body-table');
            bodyTable.innerHTML = '';
            for (const post of posts) {
                bodyTable.innerHTML += convertObjToHTML(post)
            }
        }
    } catch (error) {
        console.log(error);
    }
}
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    // If ID is empty, this is a new post - auto-generate ID
    if (!id || id.trim() === '') {
        // Get all posts to calculate max ID
        let allPostsRes = await fetch('http://localhost:3000/posts');
        if (allPostsRes.ok) {
            let allPosts = await allPostsRes.json();
            let maxId = 0;
            for (const post of allPosts) {
                let postIdNum = parseInt(post.id);
                if (postIdNum > maxId) {
                    maxId = postIdNum;
                }
            }
            id = String(maxId + 1);
        } else {
            id = "1"; // Default if no posts exist
        }
    }

    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let existingPost = await getItem.json();
        let res = await fetch('http://localhost:3000/posts/'+id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                title: title,
                views: views,
                isDeleted: existingPost.isDeleted || false
            })
        })
        
    } else {
        //fetch -> HTTP POST
        let res = await fetch('http://localhost:3000/posts', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                title: title,
                views: views,
                isDeleted: false
            })
        })
    }
    // Clear form
    document.getElementById("id_txt").value = '';
    document.getElementById("title_txt").value = '';
    document.getElementById("views_txt").value = '';
    GetData();
    return false;

}

function convertObjToHTML(post) {
    // Apply strikethrough style if post is soft-deleted
    let style = post.isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
    return `<tr ${style}>
    <td>${post.id}</td>
    <td>${post.title}</td>
    <td>${post.views}</td>
    <td>
        <input type='button' value='Edit' onclick='EditPost(${JSON.stringify(post).replace(/'/g, "&apos;")})'>
        <input type='button' value='Delete' onclick='Delete(${post.id})'>
    </td>
    </tr>`
}

function EditPost(post) {
    document.getElementById("id_txt").value = post.id;
    document.getElementById("title_txt").value = post.title;
    document.getElementById("views_txt").value = post.views;
}
async function Delete(id) {
    // Soft delete: update isDeleted to true instead of deleting
    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let post = await getItem.json();
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: true
            })
        })
        if (res.ok) {
            GetData()
        }
    }
    return false;
}
GetData();

// ============ COMMENTS CRUD OPERATIONS ============

async function GetComments() {
    try {
        let res = await fetch('http://localhost:3000/comments')
        if (res.ok) {
            let comments = await res.json();
            let commentsTable = document.getElementById('comments-table');
            commentsTable.innerHTML = '';
            for (const comment of comments) {
                commentsTable.innerHTML += convertCommentToHTML(comment)
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function convertCommentToHTML(comment) {
    // Apply strikethrough style if comment is soft-deleted
    let style = comment.isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
    return `<tr ${style}>
    <td>${comment.id}</td>
    <td>${comment.text}</td>
    <td>${comment.postId}</td>
    <td>
        <input type='button' value='Edit' onclick='EditComment(${JSON.stringify(comment).replace(/'/g, "&apos;")})'>
        <input type='button' value='Delete' onclick='DeleteComment(${comment.id})'>
    </td>
    </tr>`
}

async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postid_txt").value;

    // If ID is empty, this is a new comment - auto-generate ID
    if (!id || id.trim() === '') {
        // Get all comments to calculate max ID
        let allCommentsRes = await fetch('http://localhost:3000/comments');
        if (allCommentsRes.ok) {
            let allComments = await allCommentsRes.json();
            let maxId = 0;
            for (const comment of allComments) {
                let commentIdNum = parseInt(comment.id);
                if (commentIdNum > maxId) {
                    maxId = commentIdNum;
                }
            }
            id = String(maxId + 1);
        } else {
            id = "1"; // Default if no comments exist
        }
    }

    let getItem = await fetch('http://localhost:3000/comments/' + id);
    if (getItem.ok) {
        // Update existing comment
        let existingComment = await getItem.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                text: text,
                postId: postId,
                isDeleted: existingComment.isDeleted || false
            })
        })
    } else {
        // Create new comment
        let res = await fetch('http://localhost:3000/comments', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                text: text,
                postId: postId,
                isDeleted: false
            })
        })
    }
    // Clear form
    document.getElementById("comment_id_txt").value = '';
    document.getElementById("comment_text_txt").value = '';
    document.getElementById("comment_postid_txt").value = '';
    GetComments();
    return false;
}

function EditComment(comment) {
    document.getElementById("comment_id_txt").value = comment.id;
    document.getElementById("comment_text_txt").value = comment.text;
    document.getElementById("comment_postid_txt").value = comment.postId;
}

async function DeleteComment(id) {
    // Soft delete: update isDeleted to true instead of deleting
    let getItem = await fetch('http://localhost:3000/comments/' + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...comment,
                isDeleted: true
            })
        })
        if (res.ok) {
            GetComments()
        }
    }
    return false;
}

// Initialize both posts and comments data
GetComments();
