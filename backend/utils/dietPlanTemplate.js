/**
 * HTML template for generating diet plan PDFs
 * Uses Handlebars-style templating with the following variables:
 * - title: Diet plan title
 * - targetAudience: Target audience (e.g., "Weight Loss", "Muscle Gain")
 * - duration: Plan duration (e.g., "4 weeks")
 * - totalCalories: Daily calorie target
 * - meals: Array of meal objects with name, time, items[], and instructions
 * - notes: Additional notes for the diet plan
 * - generatedDate: Auto-generated date string
 */

const dietPlanTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}} - Diet Plan</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333; 
            line-height: 1.6;
            font-size: 14px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 25px; 
            border-bottom: 2px solid #4CAF50; 
            padding-bottom: 15px; 
        }
        .header h1 { 
            color: #4CAF50; 
            margin: 0 0 10px 0; 
            font-size: 24px;
        }
        .header p { 
            margin: 5px 0; 
            color: #555;
            font-size: 15px;
        }
        .info-section { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 25px;
            gap: 15px;
            flex-wrap: wrap;
        }
        .info-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 6px; 
            flex: 1;
            min-width: 180px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .info-box h3 { 
            margin: 0 0 8px 0; 
            color: #4CAF50;
            font-size: 15px;
        }
        .meals-section { 
            margin-bottom: 30px; 
        }
        .meals-section h2 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        }
        .meal { 
            margin-bottom: 20px; 
            border: 1px solid #e0e0e0; 
            border-radius: 6px; 
            overflow: hidden;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        .meal-header { 
            background: #4CAF50; 
            color: white; 
            padding: 10px 15px; 
        }
        .meal-header h3 { 
            margin: 0; 
            font-size: 16px;
            font-weight: 600;
        }
        .meal-content { 
            padding: 15px; 
        }
        .food-items { 
            margin: 10px 0; 
        }
        .food-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 6px 0; 
            border-bottom: 1px solid #f0f0f0; 
            font-size: 14px;
        }
        .food-item:last-child { 
            border-bottom: none; 
        }
        .instructions { 
            background: #fff8e1; 
            border-left: 3px solid #ffc107;
            border-radius: 0 4px 4px 0;
            padding: 10px 15px; 
            margin-top: 12px;
            font-size: 13px;
            line-height: 1.5;
        }
        .instructions strong {
            color: #e65100;
        }
        .notes { 
            background: #e3f2fd; 
            border-left: 3px solid #2196f3;
            border-radius: 0 4px 4px 0;
            padding: 15px; 
            margin: 25px 0;
        }
        .notes h3 {
            margin-top: 0;
            color: #0d47a1;
            font-size: 15px;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #e0e0e0; 
            color: #666;
            font-size: 12px;
        }
        @media print {
            body {
                padding: 10px;
                font-size: 12px;
            }
            .meal {
                page-break-inside: avoid;
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{title}}</h1>
        <p>Target Audience: {{targetAudience}}</p>
        <p>Duration: {{duration}}</p>
    </div>
    
    <div class="info-section">
        <div class="info-box">
            <h3>Total Calories</h3>
            <p>{{totalCalories}} kcal/day</p>
        </div>
        <div class="info-box">
            <h3>Plan Duration</h3>
            <p>{{duration}}</p>
        </div>
        <div class="info-box">
            <h3>Generated On</h3>
            <p>{{generatedDate}}</p>
        </div>
    </div>
    
    <div class="meals-section">
        <h2>Daily Meal Plan</h2>
        {{#each meals}}
        <div class="meal">
            <div class="meal-header">
                <h3>{{this.name}} - {{this.time}}</h3>
            </div>
            <div class="meal-content">
                <div class="food-items">
                    {{#each this.items}}
                    <div class="food-item">
                        <span><strong>{{this.food}}</strong></span>
                        <span>{{this.quantity}} ({{this.calories}} kcal)</span>
                    </div>
                    {{/each}}
                </div>
                {{#if this.instructions}}
                <div class="instructions">
                    <strong>Instructions:</strong> {{this.instructions}}
                </div>
                {{/if}}
            </div>
        </div>
        {{/each}}
    </div>
    
    {{#if notes}}
    <div class="notes">
        <h3>Additional Notes:</h3>
        <p>{{notes}}</p>
    </div>
    {{/if}}
    
    <div class="footer">
        <p>Generated by Gym Management System - {{generatedDate}}</p>
        <p>For any queries, please contact your gym trainer.</p>
    </div>
</body>
</html>
`;

module.exports = { dietPlanTemplate };
