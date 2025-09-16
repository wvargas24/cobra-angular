// Clase MarkdownConverter para convertir Markdown a HTML en TypeScript
export class MarkdownConverter {
    private markdownText: string;

    constructor(markdownText: string) {
        this.markdownText = markdownText;
    }

    // Método para convertir títulos de diferentes niveles
    convertHeaders(): void {
        this.markdownText = this.markdownText.replace(/^(#+)\s(.*)$/gm, (match, hashes, title) => {
            const level = hashes.length;
            return `<h${level}>${title.trim()}</h${level}>`;
        });
    }

    // Método para convertir listas sin orden y ordenadas
    convertLists(): void {
        // Convertir listas sin orden
        this.markdownText = this.markdownText.replace(/^(-|\*)\s(.*)$/gm, (match, bullet, listItem) => {
            return `<li>${listItem.trim()}</li>`;
        });

        // Convertir listas ordenadas
        this.markdownText = this.markdownText.replace(/^(\d+\.)\s(.*)$/gm, (match, number, listItem) => {
            return `<li>${listItem.trim()}</li>`;
        });

        // Convertir listas anidadas
        this.convertNestedLists('ul');
        this.convertNestedLists('ol');
    }

    // Método para convertir listas anidadas (ul u ol)
    private convertNestedLists(listType: 'ul' | 'ol'): void {
        let regexPattern = listType === 'ul' ? /^(-|\*)\s(.*)$/gm : /^(\d+\.)\s(.*)$/gm;
        let lastIndex = 0;

        while (true) {
            regexPattern.lastIndex = lastIndex;
            let match = regexPattern.exec(this.markdownText);

            if (!match) {
                break;
            }

            const listItems: string[] = [];
            const startIndex = match.index;
            const currentLevel = this.getListItemLevel(match[0]);

            while (match && this.getListItemLevel(match[0]) === currentLevel) {
                listItems.push(`<li>${match[2].trim()}</li>`);
                lastIndex = regexPattern.lastIndex;
                match = regexPattern.exec(this.markdownText);
            }

            const listHtml = `<${listType}>${listItems.join('')}</${listType}>`;
            this.markdownText = this.markdownText.substring(0, startIndex) + listHtml + this.markdownText.substring(lastIndex);
            lastIndex += listHtml.length - (lastIndex - startIndex);
        }
    }

    // Método auxiliar para obtener el nivel de un elemento de lista
    private getListItemLevel(listItem: string): number {
        return listItem.match(/^(-|\*)/) ? 1 : Number(listItem.match(/^(\d+)/)?.[0]);
    }

    // Método para convertir texto en negrita (**texto**)
    convertBoldText(): void {
        this.markdownText = this.markdownText.replace(/\*\*(.*?)\*\*/g, (match, boldText) => {
            return `<strong>${boldText}</strong>`;
        });
    }

    // Método para convertir enlaces [texto](url)
    convertLinks(): void {
        this.markdownText = this.markdownText.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
            return `<a href="${url}" target="_blank">${linkText}</a>`;
        });
    }

    // Método para convertir texto en cursiva (_texto_)
    convertItalicText(): void {
        this.markdownText = this.markdownText.replace(/_(.*?)_/g, (match, italicText) => {
            return `<em>${italicText}</em>`;
        });
    }

    // Método para convertir bloques de código (```)
    convertCodeBlocks(): void {
        this.markdownText = this.markdownText.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });
    }

    // Método para convertir saltos de línea dobles en párrafos
    convertParagraphs(): void {
        this.markdownText = this.markdownText.replace(/\n\n([^<])/g, '</p><p>$1');
        this.markdownText = `<p>${this.markdownText}</p>`;
    }

    // Método para obtener el HTML convertido
    getHtmlContent(): string {
        return this.markdownText;
    }
}
