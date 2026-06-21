import { z } from "zod";
export declare const ProposalFieldStatus: z.ZodEnum<["suggested", "approved", "rejected"]>;
export declare const AskingExpectationSchema: z.ZodObject<{
    amount_gbp: z.ZodNullable<z.ZodNumber>;
    qualifier: z.ZodEnum<["firm", "hopeful", "unknown"]>;
    raw_phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    amount_gbp: number | null;
    qualifier: "unknown" | "firm" | "hopeful";
    raw_phrase: string;
}, {
    amount_gbp: number | null;
    qualifier: "unknown" | "firm" | "hopeful";
    raw_phrase: string;
}>;
export declare const RenovationItemSchema: z.ZodObject<{
    area: z.ZodString;
    description: z.ZodString;
    estimated_cost_gbp: z.ZodNullable<z.ZodNumber>;
    urgency: z.ZodEnum<["immediate", "before_sale", "optional", "unknown"]>;
}, "strip", z.ZodTypeAny, {
    area: string;
    description: string;
    estimated_cost_gbp: number | null;
    urgency: "unknown" | "immediate" | "before_sale" | "optional";
}, {
    area: string;
    description: string;
    estimated_cost_gbp: number | null;
    urgency: "unknown" | "immediate" | "before_sale" | "optional";
}>;
export declare const FollowUpTaskSchema: z.ZodObject<{
    title: z.ZodString;
    due_in_days: z.ZodNullable<z.ZodNumber>;
    assignee: z.ZodEnum<["agent", "vendor", "internal"]>;
}, "strip", z.ZodTypeAny, {
    title: string;
    due_in_days: number | null;
    assignee: "agent" | "vendor" | "internal";
}, {
    title: string;
    due_in_days: number | null;
    assignee: "agent" | "vendor" | "internal";
}>;
export declare function proposalFieldSchema<T extends z.ZodTypeAny>(valueSchema: T): z.ZodObject<{
    value: z.ZodNullable<T>;
    confidence: z.ZodNumber;
    evidence_quote: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["suggested", "approved", "rejected"]>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    value: z.ZodNullable<T>;
    confidence: z.ZodNumber;
    evidence_quote: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["suggested", "approved", "rejected"]>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    value: z.ZodNullable<T>;
    confidence: z.ZodNumber;
    evidence_quote: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["suggested", "approved", "rejected"]>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const ExtractionFieldsSchema: z.ZodObject<{
    property_condition: z.ZodObject<{
        value: z.ZodNullable<z.ZodString>;
        confidence: z.ZodNumber;
        evidence_quote: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["suggested", "approved", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    }, {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    }>;
    seller_motivation: z.ZodObject<{
        value: z.ZodNullable<z.ZodString>;
        confidence: z.ZodNumber;
        evidence_quote: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["suggested", "approved", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    }, {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    }>;
    asking_expectation: z.ZodObject<{
        value: z.ZodNullable<z.ZodObject<{
            amount_gbp: z.ZodNullable<z.ZodNumber>;
            qualifier: z.ZodEnum<["firm", "hopeful", "unknown"]>;
            raw_phrase: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            amount_gbp: number | null;
            qualifier: "unknown" | "firm" | "hopeful";
            raw_phrase: string;
        }, {
            amount_gbp: number | null;
            qualifier: "unknown" | "firm" | "hopeful";
            raw_phrase: string;
        }>>;
        confidence: z.ZodNumber;
        evidence_quote: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["suggested", "approved", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        status: "suggested" | "approved" | "rejected";
        value: {
            amount_gbp: number | null;
            qualifier: "unknown" | "firm" | "hopeful";
            raw_phrase: string;
        } | null;
        confidence: number;
        evidence_quote: string | null;
    }, {
        status: "suggested" | "approved" | "rejected";
        value: {
            amount_gbp: number | null;
            qualifier: "unknown" | "firm" | "hopeful";
            raw_phrase: string;
        } | null;
        confidence: number;
        evidence_quote: string | null;
    }>;
    timeline: z.ZodObject<{
        value: z.ZodNullable<z.ZodString>;
        confidence: z.ZodNumber;
        evidence_quote: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["suggested", "approved", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    }, {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    }>;
    renovations: z.ZodObject<{
        value: z.ZodNullable<z.ZodArray<z.ZodObject<{
            area: z.ZodString;
            description: z.ZodString;
            estimated_cost_gbp: z.ZodNullable<z.ZodNumber>;
            urgency: z.ZodEnum<["immediate", "before_sale", "optional", "unknown"]>;
        }, "strip", z.ZodTypeAny, {
            area: string;
            description: string;
            estimated_cost_gbp: number | null;
            urgency: "unknown" | "immediate" | "before_sale" | "optional";
        }, {
            area: string;
            description: string;
            estimated_cost_gbp: number | null;
            urgency: "unknown" | "immediate" | "before_sale" | "optional";
        }>, "many">>;
        confidence: z.ZodNumber;
        evidence_quote: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["suggested", "approved", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        status: "suggested" | "approved" | "rejected";
        value: {
            area: string;
            description: string;
            estimated_cost_gbp: number | null;
            urgency: "unknown" | "immediate" | "before_sale" | "optional";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    }, {
        status: "suggested" | "approved" | "rejected";
        value: {
            area: string;
            description: string;
            estimated_cost_gbp: number | null;
            urgency: "unknown" | "immediate" | "before_sale" | "optional";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    }>;
    concerns: z.ZodObject<{
        value: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodNumber;
        evidence_quote: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["suggested", "approved", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        status: "suggested" | "approved" | "rejected";
        value: string[] | null;
        confidence: number;
        evidence_quote: string | null;
    }, {
        status: "suggested" | "approved" | "rejected";
        value: string[] | null;
        confidence: number;
        evidence_quote: string | null;
    }>;
    follow_up_tasks: z.ZodObject<{
        value: z.ZodNullable<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            due_in_days: z.ZodNullable<z.ZodNumber>;
            assignee: z.ZodEnum<["agent", "vendor", "internal"]>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            due_in_days: number | null;
            assignee: "agent" | "vendor" | "internal";
        }, {
            title: string;
            due_in_days: number | null;
            assignee: "agent" | "vendor" | "internal";
        }>, "many">>;
        confidence: z.ZodNumber;
        evidence_quote: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<["suggested", "approved", "rejected"]>;
    }, "strip", z.ZodTypeAny, {
        status: "suggested" | "approved" | "rejected";
        value: {
            title: string;
            due_in_days: number | null;
            assignee: "agent" | "vendor" | "internal";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    }, {
        status: "suggested" | "approved" | "rejected";
        value: {
            title: string;
            due_in_days: number | null;
            assignee: "agent" | "vendor" | "internal";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    property_condition: {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    };
    seller_motivation: {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    };
    asking_expectation: {
        status: "suggested" | "approved" | "rejected";
        value: {
            amount_gbp: number | null;
            qualifier: "unknown" | "firm" | "hopeful";
            raw_phrase: string;
        } | null;
        confidence: number;
        evidence_quote: string | null;
    };
    timeline: {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    };
    renovations: {
        status: "suggested" | "approved" | "rejected";
        value: {
            area: string;
            description: string;
            estimated_cost_gbp: number | null;
            urgency: "unknown" | "immediate" | "before_sale" | "optional";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    };
    concerns: {
        status: "suggested" | "approved" | "rejected";
        value: string[] | null;
        confidence: number;
        evidence_quote: string | null;
    };
    follow_up_tasks: {
        status: "suggested" | "approved" | "rejected";
        value: {
            title: string;
            due_in_days: number | null;
            assignee: "agent" | "vendor" | "internal";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    };
}, {
    property_condition: {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    };
    seller_motivation: {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    };
    asking_expectation: {
        status: "suggested" | "approved" | "rejected";
        value: {
            amount_gbp: number | null;
            qualifier: "unknown" | "firm" | "hopeful";
            raw_phrase: string;
        } | null;
        confidence: number;
        evidence_quote: string | null;
    };
    timeline: {
        status: "suggested" | "approved" | "rejected";
        value: string | null;
        confidence: number;
        evidence_quote: string | null;
    };
    renovations: {
        status: "suggested" | "approved" | "rejected";
        value: {
            area: string;
            description: string;
            estimated_cost_gbp: number | null;
            urgency: "unknown" | "immediate" | "before_sale" | "optional";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    };
    concerns: {
        status: "suggested" | "approved" | "rejected";
        value: string[] | null;
        confidence: number;
        evidence_quote: string | null;
    };
    follow_up_tasks: {
        status: "suggested" | "approved" | "rejected";
        value: {
            title: string;
            due_in_days: number | null;
            assignee: "agent" | "vendor" | "internal";
        }[] | null;
        confidence: number;
        evidence_quote: string | null;
    };
}>;
export declare const PropertyProposalExtractionSchema: z.ZodObject<{
    recording_id: z.ZodString;
    property_id: z.ZodString;
    extracted_at: z.ZodString;
    model: z.ZodString;
    prompt_version: z.ZodString;
    fields: z.ZodObject<{
        property_condition: z.ZodObject<{
            value: z.ZodNullable<z.ZodString>;
            confidence: z.ZodNumber;
            evidence_quote: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<["suggested", "approved", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        }, {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        }>;
        seller_motivation: z.ZodObject<{
            value: z.ZodNullable<z.ZodString>;
            confidence: z.ZodNumber;
            evidence_quote: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<["suggested", "approved", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        }, {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        }>;
        asking_expectation: z.ZodObject<{
            value: z.ZodNullable<z.ZodObject<{
                amount_gbp: z.ZodNullable<z.ZodNumber>;
                qualifier: z.ZodEnum<["firm", "hopeful", "unknown"]>;
                raw_phrase: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            }, {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            }>>;
            confidence: z.ZodNumber;
            evidence_quote: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<["suggested", "approved", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            status: "suggested" | "approved" | "rejected";
            value: {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            } | null;
            confidence: number;
            evidence_quote: string | null;
        }, {
            status: "suggested" | "approved" | "rejected";
            value: {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            } | null;
            confidence: number;
            evidence_quote: string | null;
        }>;
        timeline: z.ZodObject<{
            value: z.ZodNullable<z.ZodString>;
            confidence: z.ZodNumber;
            evidence_quote: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<["suggested", "approved", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        }, {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        }>;
        renovations: z.ZodObject<{
            value: z.ZodNullable<z.ZodArray<z.ZodObject<{
                area: z.ZodString;
                description: z.ZodString;
                estimated_cost_gbp: z.ZodNullable<z.ZodNumber>;
                urgency: z.ZodEnum<["immediate", "before_sale", "optional", "unknown"]>;
            }, "strip", z.ZodTypeAny, {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }, {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }>, "many">>;
            confidence: z.ZodNumber;
            evidence_quote: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<["suggested", "approved", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            status: "suggested" | "approved" | "rejected";
            value: {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        }, {
            status: "suggested" | "approved" | "rejected";
            value: {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        }>;
        concerns: z.ZodObject<{
            value: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
            confidence: z.ZodNumber;
            evidence_quote: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<["suggested", "approved", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            status: "suggested" | "approved" | "rejected";
            value: string[] | null;
            confidence: number;
            evidence_quote: string | null;
        }, {
            status: "suggested" | "approved" | "rejected";
            value: string[] | null;
            confidence: number;
            evidence_quote: string | null;
        }>;
        follow_up_tasks: z.ZodObject<{
            value: z.ZodNullable<z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                due_in_days: z.ZodNullable<z.ZodNumber>;
                assignee: z.ZodEnum<["agent", "vendor", "internal"]>;
            }, "strip", z.ZodTypeAny, {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }, {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }>, "many">>;
            confidence: z.ZodNumber;
            evidence_quote: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<["suggested", "approved", "rejected"]>;
        }, "strip", z.ZodTypeAny, {
            status: "suggested" | "approved" | "rejected";
            value: {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        }, {
            status: "suggested" | "approved" | "rejected";
            value: {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        }>;
    }, "strip", z.ZodTypeAny, {
        property_condition: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        seller_motivation: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        asking_expectation: {
            status: "suggested" | "approved" | "rejected";
            value: {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            } | null;
            confidence: number;
            evidence_quote: string | null;
        };
        timeline: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        renovations: {
            status: "suggested" | "approved" | "rejected";
            value: {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        concerns: {
            status: "suggested" | "approved" | "rejected";
            value: string[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        follow_up_tasks: {
            status: "suggested" | "approved" | "rejected";
            value: {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
    }, {
        property_condition: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        seller_motivation: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        asking_expectation: {
            status: "suggested" | "approved" | "rejected";
            value: {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            } | null;
            confidence: number;
            evidence_quote: string | null;
        };
        timeline: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        renovations: {
            status: "suggested" | "approved" | "rejected";
            value: {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        concerns: {
            status: "suggested" | "approved" | "rejected";
            value: string[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        follow_up_tasks: {
            status: "suggested" | "approved" | "rejected";
            value: {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    recording_id: string;
    property_id: string;
    extracted_at: string;
    model: string;
    prompt_version: string;
    fields: {
        property_condition: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        seller_motivation: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        asking_expectation: {
            status: "suggested" | "approved" | "rejected";
            value: {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            } | null;
            confidence: number;
            evidence_quote: string | null;
        };
        timeline: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        renovations: {
            status: "suggested" | "approved" | "rejected";
            value: {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        concerns: {
            status: "suggested" | "approved" | "rejected";
            value: string[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        follow_up_tasks: {
            status: "suggested" | "approved" | "rejected";
            value: {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
    };
}, {
    recording_id: string;
    property_id: string;
    extracted_at: string;
    model: string;
    prompt_version: string;
    fields: {
        property_condition: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        seller_motivation: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        asking_expectation: {
            status: "suggested" | "approved" | "rejected";
            value: {
                amount_gbp: number | null;
                qualifier: "unknown" | "firm" | "hopeful";
                raw_phrase: string;
            } | null;
            confidence: number;
            evidence_quote: string | null;
        };
        timeline: {
            status: "suggested" | "approved" | "rejected";
            value: string | null;
            confidence: number;
            evidence_quote: string | null;
        };
        renovations: {
            status: "suggested" | "approved" | "rejected";
            value: {
                area: string;
                description: string;
                estimated_cost_gbp: number | null;
                urgency: "unknown" | "immediate" | "before_sale" | "optional";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        concerns: {
            status: "suggested" | "approved" | "rejected";
            value: string[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
        follow_up_tasks: {
            status: "suggested" | "approved" | "rejected";
            value: {
                title: string;
                due_in_days: number | null;
                assignee: "agent" | "vendor" | "internal";
            }[] | null;
            confidence: number;
            evidence_quote: string | null;
        };
    };
}>;
export type ProposalField<T> = {
    value: T | null;
    confidence: number;
    evidence_quote: string | null;
    status: "suggested" | "approved" | "rejected";
};
export type PropertyProposalExtraction = z.infer<typeof PropertyProposalExtractionSchema>;
export declare const EXTRACTION_PROMPT_VERSION = "m4-v1";
export declare const EXTRACTION_SYSTEM_PROMPT = "You extract structured property valuation insights from UK estate agent conversation transcripts.\nOutput ONLY valid JSON matching the schema.\nNever invent facts. If not mentioned, set value null and confidence 0.\nInclude evidence_quote as exact substring from transcript.";
export declare function buildExtractionUserPrompt(input: {
    transcript: string;
    property_address: string;
    contact_name: string;
    appointment_date: string;
}): string;
export declare function applyEvidencePenalty<T extends ProposalField<unknown>>(field: T, transcript: string): T;
export declare function fieldsNeedingReview(fields: PropertyProposalExtraction["fields"]): string[];
export declare const PROPOSAL_FIELD_MAP: Record<string, string>;
