import { z } from "zod";
export function registerSubmissionTools(server, canvas) {
    // Tool: list-assignment-submissions
    server.tool("list-assignment-submissions", "Fetch every student's submission status & comments for an assignment.", {
        courseId: z.string().describe("The ID of the course"),
        assignmentId: z.string().describe("The ID of the assignment"),
        anonymous: z.boolean().default(true).describe("Whether to anonymize student names and emails (default: true for privacy)")
    }, async ({ courseId, assignmentId, anonymous = true }) => {
        try {
            const response = await canvas.listAssignmentSubmissions(courseId, assignmentId, {}, { anonymous });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch assignment submissions: ${error.message}`);
            }
            throw new Error('Failed to fetch assignment submissions: Unknown error');
        }
    });
    // Tool: grade-submission
    server.tool("grade-submission", "Write back a score, grade, rubric points, or comment for a student's submission.", {
        courseId: z.string().describe("The ID of the course"),
        assignmentId: z.string().describe("The ID of the assignment"),
        userId: z.string().describe("The ID of the student/user"),
        posted_grade: z.string().optional(),
        score: z.number().optional(),
        rubric_assessment: z.any().optional(),
        comment: z.string().optional()
    }, async ({ courseId, assignmentId, userId, posted_grade, score, rubric_assessment, comment }) => {
        try {
            const payload = {};
            if (posted_grade !== undefined)
                payload.posted_grade = posted_grade;
            if (score !== undefined)
                payload.score = score;
            if (rubric_assessment !== undefined)
                payload.rubric_assessment = rubric_assessment;
            if (comment !== undefined)
                payload.comment = { text_comment: comment };
            const response = await canvas.gradeSubmission(courseId, assignmentId, userId, payload);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to grade submission: ${error.message}`);
            }
            throw new Error('Failed to grade submission: Unknown error');
        }
    });
    // Tool: post-submission-comment
    server.tool("post-submission-comment", "Attach targeted feedback as a comment on a student's submission.", {
        courseId: z.string().describe("The ID of the course"),
        assignmentId: z.string().describe("The ID of the assignment"),
        userId: z.string().describe("The ID of the student/user"),
        comment: z.string().describe("The comment text to post")
    }, async ({ courseId, assignmentId, userId, comment }) => {
        try {
            // Note: A specific client method for this could be added to CanvasClient
            // For now, using the generic put method directly as the endpoint structure is slightly different.
            const response = await canvas.put(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}/comments`, { comment: { text_comment: comment } });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to post submission comment: ${error.message}`);
            }
            throw new Error('Failed to post submission comment: Unknown error');
        }
    });
}
