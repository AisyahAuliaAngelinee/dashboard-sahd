import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

test('bundled anatomy lessons and study banks include valid readings and answer keys',()=>{
 for(const subject of ['digestive','respiratory','lymphoid']){
  const bank=JSON.parse(readFileSync(new URL('../public/human-atlas/learn/'+subject+'.json',import.meta.url)));
  assert.equal(bank.articles.length,4);
  assert.ok(bank.articles.every(article=>article.sections.length&&article.sections.every(section=>typeof section.markdown==='string'&&section.markdown.length)));
  for(const activity of ['quiz','fill','flashcards','glossary'])assert.ok(bank[activity].length,subject+' '+activity);
  assert.ok(bank.quiz.every(question=>question.choices.some(choice=>choice.id===question.correctChoiceId)));
  assert.ok(bank.fill.every(question=>question.answer&&Array.isArray(question.acceptedAnswers)));
  assert.ok(bank.flashcards.every(card=>card.front&&card.back));
  assert.ok(bank.glossary.every(item=>item.term&&item.definition&&Array.isArray(item.aliases)));
 }
});
