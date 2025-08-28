/**
 * Enhanced HTML template for generating diet plan PDFs matching the Indian Diet Plan format
 * Uses Handlebars-style templating with the following variables:
 * - title: Diet plan title
 * - targetAudience: Target audience (e.g., "Weight Loss", "Muscle Gain")
 * - duration: Plan duration (e.g., "4 weeks")
 * - totalCalories: Daily calorie target
 * - totalProtein: Daily protein target
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
            padding: 15px; 
            color: #333; 
            line-height: 1.4;
            font-size: 12px;
            background: #fff;
        }
        
        .header { 
            text-align: center; 
            margin-bottom: 20px; 
            padding-bottom: 15px; 
        }
        
        .header h1 { 
            color: #2c3e50; 
            margin: 0 0 8px 0; 
            font-size: 22px;
            font-weight: bold;
        }
        
        .header h2 { 
            color: #555; 
            margin: 0 0 15px 0; 
            font-size: 16px;
            font-weight: normal;
        }
        
        .diet-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
        }
        
        .diet-table th {
            background-color: #f8f9fa;
            border: 1px solid #333;
            padding: 8px 6px;
            text-align: center;
            font-weight: bold;
            color: #333;
        }
        
        .diet-table td {
            border: 1px solid #333;
            padding: 6px 8px;
            text-align: left;
            vertical-align: middle;
        }
        
        .time-column {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        }
        
        .meal-group {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .calories-column,
        .protein-column,
        .amount-column {
            text-align: center;
            width: 60px;
        }
        
        .menu-column {
            width: 120px;
        }
        
        .ingredients-column {
            width: 180px;
        }
        
        .amount-column {
            width: 100px;
        }
        
        .total-row {
            background-color: #e8f5e8;
            font-weight: bold;
        }
        
        .meal-divider {
            background-color: #f5f5f5;
            height: 2px;
        }
        
        .footer-info {
            margin-top: 25px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            font-size: 11px;
        }
        
        .footer-info h3 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 13px;
        }
        
        .notes-section {
            margin-top: 20px;
            padding: 12px;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
        }
        
        .notes-section h3 {
            margin-top: 0;
            color: #856404;
            font-size: 13px;
        }
        
        @media print {
            body {
                padding: 10px;
                font-size: 10px;
            }
            
            .diet-table {
                font-size: 9px;
            }
            
            .diet-table th,
            .diet-table td {
                padding: 4px 5px;
            }
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
    <h1>Focus Gym</h1>

        <h2>{{totalCalories}} Calorie {{title}}</h2>
        <h2>({{targetAudience}} - {{duration}})</h2>
    </div>
    
    <table class="diet-table">
        <thead>
            <tr>
                <th class="time-column">Time</th>
                <th class="menu-column">Menu</th>
                <th class="ingredients-column">Ingredients</th>
                <th class="amount-column">Amount</th>
                <th class="calories-column">Calories</th>
                <th class="protein-column">Protein (g)</th>
            </tr>
        </thead>
        <tbody>
            {{#each meals}}
            {{#if @first}}{{else}}<tr class="meal-divider"><td colspan="6"></td></tr>{{/if}}
            
            {{#each this.items}}
            {{#if @first}}
            <tr>
                <td class="time-column" rowspan="{{../items.length}}">{{../name}}</td>
                <td class="menu-column">{{this.food}}</td>
                <td class="ingredients-column">{{this.ingredients}}</td>
                <td class="amount-column">{{this.quantity}}</td>
                <td class="calories-column">{{this.calories}}</td>
                <td class="protein-column">{{this.protein}}</td>
            </tr>
            {{else}}
            <tr>
                <td class="menu-column">{{this.food}}</td>
                <td class="ingredients-column">{{this.ingredients}}</td>
                <td class="amount-column">{{this.quantity}}</td>
                <td class="calories-column">{{this.calories}}</td>
                <td class="protein-column">{{this.protein}}</td>
            </tr>
            {{/if}}
            {{/each}}
            {{/each}}
            
            <tr class="meal-divider"><td colspan="6"></td></tr>
            <tr class="total-row">
                <td class="time-column"><strong>TOTAL</strong></td>
                <td class="menu-column"></td>
                <td class="ingredients-column"></td>
                <td class="amount-column"></td>
                <td class="calories-column"><strong>{{totalCalories}}</strong></td>
                <td class="protein-column"><strong>{{totalProtein}}</strong></td>
            </tr>
        </tbody>
    </table>
    
    {{#if notes}}
    <div class="notes-section">
        <h3>Important Notes:</h3>
        <p>{{notes}}</p>
    </div>
    {{/if}}
    
    <div class="footer-info">
        <h3>Diet Plan Information:</h3>
        <p><strong>Target:</strong> {{targetAudience}}</p>
        <p><strong>Duration:</strong> {{duration}}</p>
        <p><strong>Daily Calories:</strong> {{totalCalories}} kcal</p>
        <p><strong>Daily Protein:</strong> {{totalProtein}} grams</p>
        <p><strong>Generated on:</strong> {{generatedDate}}</p>
        <br>
        <p><em>Please consult with your nutritionist or trainer before following this diet plan. Individual requirements may vary.</em></p>
    </div>
</body>
</html>
`;

module.exports = { dietPlanTemplate };