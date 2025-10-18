// blog.js - Renders blog posts (if using JS for blog list)
const posts = [
  { title: "Why Nigerians Love Jollof Rice", desc: "A deep dive into the nation's favorite dish.", date: "2025-08-30", link: "#" },
  { title: "Our Chef's Top Cooking Tips", desc: "Secrets to making meals at home.", date: "2025-09-15", link: "#" },
];

const renderBlog = () => {
  const blogDiv = document.getElementById('blogPosts');
  if (!blogDiv) return;
  blogDiv.innerHTML = '';
  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
      <h3>${post.title}</h3>
      <p><em>${post.date}</em></p>
      <p>${post.desc}</p>
      <a href="${post.link}" class="btn">Read More</a>
    `;
    blogDiv.appendChild(card);
  });
};
document.addEventListener('DOMContentLoaded', renderBlog);