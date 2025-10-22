// Company Info Web Component
class CompanyInfo extends HTMLElement {
    constructor() {
        super();
        this.companyName = this.getAttribute('company-name') || 'KenesLab';
        this.description = this.getAttribute('description') || 'KenesLab은 혁신적인 기술 솔루션을 제공하는 회사입니다.';
        this.linkUrl = this.getAttribute('link-url') || '/about.html';
        this.linkText = this.getAttribute('link-text') || '자세히 보기 →';
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="sidebar-section company-info">
                <h3>회사 소개</h3>
                <p>${this.description}</p>
                <a href="${this.linkUrl}" class="btn-link">${this.linkText}</a>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .company-info p {
                margin-bottom: 1rem;
                line-height: 1.6;
            }

            .btn-link {
                display: inline-block;
                color: var(--accent-color);
                font-weight: 600;
                transition: var(--transition);
            }

            .btn-link:hover {
                transform: translateX(4px);
                color: var(--accent-hover);
            }
        `;
        this.appendChild(style);
    }

    // Allow dynamic updates
    static get observedAttributes() {
        return ['company-name', 'description', 'link-url', 'link-text'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch(name) {
                case 'company-name':
                    this.companyName = newValue;
                    break;
                case 'description':
                    this.description = newValue;
                    break;
                case 'link-url':
                    this.linkUrl = newValue;
                    break;
                case 'link-text':
                    this.linkText = newValue;
                    break;
            }
            this.render();
        }
    }
}

customElements.define('company-info', CompanyInfo);
