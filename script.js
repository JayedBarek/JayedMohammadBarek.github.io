// GitHub username
const githubUsername = 'JayedBarek';

// Repositories to exclude from display (case-insensitive)
const excludedRepos = [
    'JayedMohammadBarek.github.io',
    'jayedbarek.github.io',
    'jayedmohammadbarek.github.io'
].map(name => name.toLowerCase());

// Define the exact order of repositories
const repoOrder = [
    'CSCE5210-Introduction-to-AI',
    'CSCE5150-Analysis-of-Computer-Algorithm',
    'CSCE5350-Fundamental-of-Database',
    'Project-Reports'
];

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
    
    return `
        <div class="project-card">
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
                // Get the index of each repo in the order array
                const indexA = repoOrder.indexOf(a.name);
                const indexB = repoOrder.indexOf(b.name);
                
                // If both repos are in the order array, sort by their position
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                
                // If only one repo is in the order array, prioritize it
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                
                // For repos not in the order array, sort by update date
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
