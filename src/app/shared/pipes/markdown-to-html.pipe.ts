import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';

@Pipe({
  name: 'markdownToHtml',
  standalone: true
})
export class MarkdownToHtmlPipe implements PipeTransform {
  private marked = new Marked();

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string | undefined): SafeHtml {
    if (!value) {
      return '';
    }
    const html = this.marked.parse(value) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}