export enum Phase {
    ACTION = 'action',
    END = 'end', // specifically, *game* end.
    PRODUCTION = 'production',
    RESEARCH = 'research',
    INITIALDRAFTING = 'initial_drafting',
    DRAFTING = 'drafting',
    PRELUDES = 'preludes',
    CEOS = 'ceos',
    SOLAR = 'solar',
    INTERGENERATION = 'intergeneration',
    TIMEOUT = 'timeout', // 天梯 有玩家超时，结束游戏
    ABANDON = 'abandon', // 天梯 所有玩家放弃游戏，结束游戏
}
