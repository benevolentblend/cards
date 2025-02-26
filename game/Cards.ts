// Based off of https://github.com/mitch-b/typedeck

import { getCardValues } from "@/utils";

export type CardName =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Reverse";

export type CardSuit = "R" | "B" | "G" | "Y";

export type Card = `${CardSuit}-${CardName}`;

const HAND_SIZE = 7;

interface ICardCollection {
  getCards(): Card[];
  addCards(cards: Card[]): ICardCollection;
  removeCards(cards: Card[]): ICardCollection;
  takeCard(): Card;
  takeCards(amount: number): Card[];
  getCount(): number;
  isEmpty(): boolean;
  hasCard(card: Card): boolean;
  hasCards(cards: Card[]): boolean;
  shuffle(): void;
  indexOfCard(card: Card): number;
  cardAtIndex(index: number): Card;
}

interface IHand extends ICardCollection {
  playCard(card: Card): void;
}

interface IDeck extends ICardCollection {
  deal(size: number): IHand;
}

function cardsAreEquivalent(a: Card, b: Card) {
  const { suit: aCardSuit, name: aCardName } = getCardValues(a);
  const { suit: bCardSuit, name: bCardName } = getCardValues(b);
  return aCardSuit === bCardSuit && aCardName === bCardName;
}

export class CardCollection implements ICardCollection {
  constructor(private cards: Card[] = []) {}

  public getCards() {
    return this.cards;
  }

  public drawCard(): Card {
    const cards = this.getCards();
    if (cards.length < 1) {
      throw new Error("No cards remaining");
    }

    return cards.shift() as Card;
  }

  public hasCard(card: Card): boolean {
    return this.getCards().some((c: Card) => c === card);
  }

  public hasCards(cards: Card[]): boolean {
    if (!this.hasCard(cards.shift() as Card)) {
      return false;
    }
    if (cards && cards.length > 0) {
      return this.hasCards(cards);
    } else {
      return true;
    }
  }

  public getCount(): number {
    return this.getCards().length;
  }

  public addCards(cards: Card[]): this {
    this.getCards().unshift(...cards);
    return this;
  }

  public removeCards(cards: Card[]): this {
    cards.forEach((card) => {
      const position: number = this.indexOfCard(card);
      if (position > -1) {
        this.getCards().splice(position, 1);
      } else {
        throw new Error("Card does not exist in collection");
      }
    });
    return this;
  }

  public indexOfCard(card: Card): number {
    for (let i = 0; i < this.getCount(); i++) {
      const currentCard = this.getCards()[i];
      if (cardsAreEquivalent(currentCard, card)) {
        return i;
      }
    }
    return -1;
  }

  public isEmpty(): boolean {
    return this.getCount() === 0;
  }

  public takeCard(front = true): Card {
    if (!this.isEmpty()) {
      return this.getCards().shift() as Card;
    }
    throw new Error("No cards remaining in pile");
  }

  public takeCards(amount: number, front = false): Card[] {
    if (!amount || amount < 1) {
      amount = this.getCount();
    }
    // tslint:disable-next-line:prefer-const
    let pulledCards: Card[] = [];
    while (!this.isEmpty() && pulledCards.length < amount) {
      if (front) pulledCards.push(this.getCards().shift() as Card);
      else pulledCards.push(this.getCards().pop() as Card);
    }
    return pulledCards;
  }

  public shuffle() {
    const cards = this.getCards();
    const length = cards.length;
    if (length < 2) {
      throw new Error("Not enough cards to shuffle");
    }
    for (let i = length; i; i--) {
      const n = Math.floor(Math.random() * i);
      [cards[i - 1], cards[n]] = [cards[n], cards[i - 1]];
    }
    return cards;
  }

  public cardAtIndex(index: number): Card {
    if (index >= 0 && index <= this.getCount() - 1) {
      return this.getCards()[index];
    } else {
      throw new Error("Card collection does not contain card at index");
    }
  }
}

interface DeckBuildArgs {
  duplicates?: number;
  suits?: CardSuit[];
  cardNames?: CardName[];
}

export class Deck extends CardCollection implements IDeck {
  constructor(cards: Card[] = []) {
    super(cards);
  }

  public static Build({
    duplicates = 1,
    suits = ["R", "B", "G", "Y"],
    cardNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Reverse"],
  }: DeckBuildArgs) {
    const cards: Card[] = [];

    for (let i = 0; i < duplicates; i++) {
      suits.forEach((suit) =>
        cardNames.forEach((cardName) => cards.push(`${suit}-${cardName}`))
      );
    }

    return new Deck(cards);
  }

  public deal(size: number) {
    const hand = new Hand();
    hand.addCards(this.takeCards(size, false));
    return hand;
  }
}

export class Hand extends CardCollection implements IHand {
  constructor(cards: Card[] = []) {
    super(cards);
  }

  public playCard(card: Card) {
    this.removeCards([card]);
  }
}
