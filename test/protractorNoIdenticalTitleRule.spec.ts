const describe = (title: string, fct: () => void) => { /**/ };
const it = (title: string, fct: () => void) => { /**/ };

describe("top level describe", () => {
  describe("2nd level desribe", () => { /**/ });
  describe("2nd level desribe", () => { /**/ });

  it("1st level it", () => { /**/ });
  it("1st level it", () => { /**/ });

  describe("2nd level with existing it", () => {
    it("1st level it", () => { /**/ });
  });

  describe("1st", () => {
    it("level it", () => { /**/ });
  });
});
