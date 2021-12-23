export const gameboards = () => {
    return {
        board_001:board_001()
    }
}

const board_001 = () => {
    return [
        [{type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}],
        [{type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}],
        [null, null, null, null, null, null, null, null,],
        [null, null, null, null, null, null, null, null,],
        [null, null, null, null, null, null, null, null,],
        [null, null, null, null, null, null, null, null,],
        [{type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}],
        [{type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}, {type: "pawn"}],
    ]
}
