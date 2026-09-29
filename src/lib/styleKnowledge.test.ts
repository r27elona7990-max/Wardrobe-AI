import { describe, expect, it } from "vitest";
import {
  buildStylistExplanation,
  detectItemColors,
  scoreItemForStyle,
  scoreOutfitDraft,
} from "./styleKnowledge";

const context = { occasion: "Casual", weather: "Mild" };

const top = {
  id: "top-1",
  name: "Fitted white crop top",
  category: "Tops",
  tags: "white, fitted, y2k",
};

const bottom = {
  id: "bottom-1",
  name: "Wide leg blue denim",
  category: "Bottoms",
  tags: "blue, denim, wide leg",
};

const shoes = {
  id: "shoes-1",
  name: "White sneakers",
  category: "Shoes",
  tags: "white, casual",
};

describe("style knowledge", () => {
  it("detects colors without treating baby blue as generic blue twice", () => {
    expect(
      detectItemColors({
        id: "1",
        name: "Baby blue shirt",
        category: "Shirts",
        tags: null,
      })
    ).toEqual(["babyBlue"]);
  });

  it("scores a complete outfit and produces a contextual explanation", () => {
    const draft = { top, bottom, shoes };
    const result = scoreOutfitDraft(draft, context);
    const explanation = buildStylistExplanation(draft, context);

    expect(result.score).toBeGreaterThan(0);
    expect(explanation).toContain("casual");
    expect(explanation).toContain("mild");
    expect(explanation).toContain("balances the volume");
  });

  it("ranks a party look above office basics for a party occasion", () => {
    const officeDraft = {
      top: { id: "office-top", name: "Formal Shirt", category: "Shirts", tags: "office, tailored, white" },
      bottom: { id: "office-bottom", name: "Trousers", category: "Bottoms", tags: "workwear, formal, black" },
      shoes: { id: "office-shoes", name: "Loafers", category: "Shoes", tags: "smart, formal, black" },
    };
    const partyDraft = {
      top: { id: "party-top", name: "Corset Going-Out Top", category: "Tops", tags: "party, fitted, black" },
      bottom: { id: "party-bottom", name: "Mini Skirt", category: "Skirts", tags: "party, statement, black" },
      shoes: { id: "party-shoes", name: "Stiletto Heels", category: "Heels", tags: "heels, party, black" },
    };
    const partyContext = { occasion: "Party", weather: "Mild" };

    expect(scoreOutfitDraft(partyDraft, partyContext).score).toBeGreaterThan(
      scoreOutfitDraft(officeDraft, partyContext).score
    );
  });

  it("penalizes clothing that conflicts with the selected weather", () => {
    const hotTop = { ...top, id: "hot-top", name: "Wool Knit Sweater", tags: "wool, knit" };
    const lightTop = { ...top, id: "light-top", name: "Linen Tank", tags: "linen, tank, summer" };
    const hotContext = { occasion: "Casual", weather: "Hot" };

    expect(scoreItemForStyle(lightTop, hotContext)).toBeGreaterThan(
      scoreItemForStyle(hotTop, hotContext)
    );
  });
});
