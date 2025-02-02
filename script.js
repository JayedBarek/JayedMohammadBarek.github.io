// GitHub username
const githubUsername = 'JayedBarek';

// Repositories to exclude from display (case-insensitive)
const excludedRepos = [
    'JayedMohammadBarek.github.io',
    'jayedbarek.github.io',
    'jayedmohammadbarek.github.io'
].map(name => name.toLowerCase());

// Priority repositories that should be displayed first
const priorityRepos = ['Project-Reports'];

// Function to fetch GitHub repositories
async function fetchGitHubRepos() {
    const projectsContainer = document.getElementById('projects-container');
    try {
        projectsContainer.innerHTML = '<p>Loading repositories...</p>';
        
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
        }
        
        const repos = await response.json();
        
        if (repos.length === 0) {
            projectsContainer.innerHTML = '<p>No repositories found</p>';
            return [];
        }
        
        return repos;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        projectsContainer.innerHTML = `
            <p>Error loading repositories. Please try again later.</p>
            <p class="error-message">${error.message}</p>
        `;
        return [];
    }
}

// Function to create a project card
function createProjectCard(repo) {
    const technologies = repo.topics || [];
    const description = repo.description || 'No description available';
    const isPriority = priorityRepos.includes(repo.name);
    
    return `
        <div class="project-card${isPriority ? ' priority-project' : ''}">
            <h3>${repo.name}</h3>
            <p>${description}</p>
            <div class="tech-stack">
                ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                ${repo.language ? `<span class="tech-tag primary">${repo.language}</span>` : ''}
            </div>
            <div class="project-links">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
            </div>
        </div>
    `;
}

// Load repositories when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const projectsContainer = document.getElementById('projects-container');
    const repos = await fetchGitHubRepos();
    
    if (repos.length > 0) {
        const filteredRepos = repos
            .filter(repo => {
                const repoName = repo.name.toLowerCase();
                return !repo.fork && 
                       !repo.archived && 
                       !excludedRepos.includes(repoName);
            })
            .sort((a, b) => {
                // First, sort by priority
                const aPriority = priorityRepos.includes(a.name);
                const bPriority = priorityRepos.includes(b.name);
                if (aPriority !== bPriority) {
                    return bPriority ? 1 : -1;
                }
                // Then by update date
                return new Date(b.updated_at) - new Date(a.updated_at);
            });
        
        if (filteredRepos.length > 0) {
            projectsContainer.innerHTML = filteredRepos
                .map(repo => createProjectCard(repo))
                .join('');
        } else {
            projectsContainer.innerHTML = '<p>No repositories to display</p>';
        }
    }
});
