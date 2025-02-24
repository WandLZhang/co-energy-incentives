import functions_framework
from firebase_admin import initialize_app, firestore
from flask import jsonify

# Initialize Firebase Admin without service account (uses compute default credentials)
app = initialize_app()
db = firestore.client(app, "co-energy")

def apply_filters(query, data):
    """Apply filters to the Firestore query based on user responses."""
    print(f"Applying filters with data: {data}")
    # Start with zipcode filter if provided
    if 'zipcode' in data:
        query = query.where('eligible_zip_codes', 'array_contains', data['zipcode'])
    
    # Filter by owner status (Q2)
    if 'Q2' in data:
        if data['Q2'] == 'a':  # I own my home
            # Return programs that either:
            # 1. Have no owner_status restrictions (null/empty array)
            # 2. Support homeowners only
            # 3. Support both homeowners and renters
            query = query.where('owner_status', 'in', [None, [], ['homeowner'], ['homeowner', 'renter'], ['renter', 'homeowner']])
        elif data['Q2'] == 'b':  # I rent my home
            # Return programs that either:
            # 1. Have no owner_status restrictions (null/empty array)
            # 2. Support renters only
            # 3. Support both homeowners and renters
            query = query.where('owner_status', 'in', [None, [], ['renter'], ['homeowner', 'renter'], ['renter', 'homeowner']])
        # For 'c' (Other) and 'd' (Not applicable), we don't apply owner_status filter
    
    # Filter by items/upgrades (Q3) - Inclusive OR for selected items
    if 'Q3' in data and isinstance(data['Q3'], list):
        # Map frontend option values to backend item values
        item_map = {
            'a': 'attic_insulation',
            'b': 'wall_insulation',
            'c': 'floor_insulation',
            'd': 'rim_joist_insulation',
            'e': 'air_sealing',
            'f': 'duct_sealing',
            'g': 'window_replacement',
            'h': 'door_replacement',
            'i': 'heat_pump_water_heater',
            'j': 'electric_resistance_water_heater',
            'k': 'ducted_heat_pump',
            'l': 'ductless_heat_pump',
            'm': 'air_to_water_heat_pump',
            'n': 'ground_source_heat_pump',
            'o': 'induction_stove',
            'p': 'heat_pump_dryer',
            'q': 'electric_resistance_dryer',
            'r': 'smart_thermostat',
            's': 'whole_house_fan',
            't': 'evaporative_cooler',
            'u': 'ev_charger_l2',
            'v': 'ev_charger_dcfc',
            'w': 'ev_new',
            'x': 'ev_used',
            'y': 'ebike',
            'z': 'electric_outdoor_equipment',
            'aa': 'battery_storage',
            'bb': 'electric_thermal_storage',
            'cc': 'energy_audit',
            'dd': 'electric_panel_upgrade',
            'ee': 'electric_wiring_upgrade',
            'ff': 'electric_service_upgrades',
            'gg': 'adaptive_ebike',
            'hh': 'other_weatherization',
            'ii': 'other'
        }
        
        # Get all relevant items
        selected_items = [item_map[opt] for opt in data['Q3'] if opt in item_map]
        if selected_items:
            # Filter for programs that include any of the selected items (OR condition)
            query = query.where('items', 'array_contains_any', selected_items)
    
    # Filter by payment methods (Q4, Q5, Q6, Q7)
    # If user answers 'no' to a payment method, exclude programs that ONLY have that method
    
    # Handle point-of-sale rebates (Q4)
    if 'Q4' in data:
        if data['Q4'] == 'b':  # No to point-of-sale
            # Exclude programs that only have pos_rebate
            query = query.where('payment_methods', '!=', ['pos_rebate'])
    
    # Handle mail-in/online rebates (Q5)
    if 'Q5' in data:
        if data['Q5'] == 'b':  # No to rebates
            # Exclude programs that only have rebate
            query = query.where('payment_methods', '!=', ['rebate'])
    
    # Handle account credits (Q6)
    if 'Q6' in data:
        if data['Q6'] == 'b':  # No to account credits
            # Exclude programs that only have account_credit
            query = query.where('payment_methods', '!=', ['account_credit'])
    
    # Handle tax credits (Q7)
    if 'Q7' in data:
        if data['Q7'] == 'b':  # No to tax credits
            # Exclude programs that only have tax_credit
            query = query.where('payment_methods', '!=', ['tax_credit'])
    
    # Filter by income qualification (Q8, Q9)
    if 'Q8' in data and data['Q8'] == 'a':
        # User wants assistance programs
        query = query.where('payment_methods', 'array_contains', 'assistance_program')
        query = query.where('low_income', '!=', None)
    elif 'Q9' in data and data['Q9'] == 'b':
        # User is not low-income, exclude programs that ONLY have low_income requirements
        # i.e., keep programs where low_income is null or where it's one of multiple options
        query = query.where('low_income', 'in', [None, False])
    
    # Exclusive filters (narrow down results):
    # - Zipcode (must be in eligible_zip_codes)
    # - Owner status (must match user's status)
    # - Income qualification (must be income-qualified if user wants assistance programs)
    
    # Inclusive filters (add more possibilities):
    # - Items/upgrades (Q3) - any matching item makes a program eligible
    # - Payment methods (Q4-Q7) - any matching payment method makes a program eligible
    # - Conditional questions (Q10-Q13) - any matching answer makes a program eligible
    
    # Filter by heat pump type (Q10) - Inclusive OR
    if 'Q10' in data and isinstance(data['Q10'], list) and data['Q10']:
        # If user selected any heat pump types, show programs that match any selection
        query = query.where('answers.Q10', 'array_contains_any', data['Q10'])
    
    # Filter by EV charger type (Q11) - Inclusive OR
    if 'Q11' in data and data['Q11']:
        # If user selected a charger type, show programs that include it
        # Using array_contains since a program might support multiple types
        query = query.where('answers.Q11', 'array_contains', data['Q11'])
    
    # Filter by e-bike type (Q12) - Inclusive OR
    if 'Q12' in data and data['Q12']:
        # If user selected a bike type, show programs that include it
        # Using array_contains since a program might support multiple types
        query = query.where('answers.Q12', 'array_contains', data['Q12'])
    
    # Filter by outdoor equipment type (Q13) - Inclusive OR
    if 'Q13' in data and isinstance(data['Q13'], list) and data['Q13']:
        # If user selected any equipment types, show programs that match any selection
        query = query.where('answers.Q13', 'array_contains_any', data['Q13'])
    
    return query

def process_results(results):
    """Process query results to return summary and program details."""
    print("Starting to process results")
    programs = []
    total_amount = 0
    
    try:
        results_list = list(results)  # Convert stream to list to check if empty
        print(f"Found {len(results_list)} documents")
        
        for doc in results_list:
            data = doc.to_dict()
            print(f"Processing document {doc.id}: {data}")
            # Get amount, defaulting to 0 if both amount fields are None
            amount_max = data.get('amount_maximum')
            amount_num = data.get('amount_number')
            amount = amount_max if amount_max is not None else (amount_num if amount_num is not None else 0)
            
            programs.append({
                'id': doc.id,
                'short_description_en': data.get('short_description_en', ''),
                'short_description_es': data.get('short_description_es', ''),
                'amount': amount
            })
            
            # Only add to total if amount is a number
            if isinstance(amount, (int, float)):
                total_amount += amount
            
        return {
            'opportunities_count': len(programs),
            'total_potential': total_amount,
            'programs': programs
        }
    except Exception as e:
        print(f"Error processing results: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise  # Re-raise the exception to be caught by the outer try-except

@functions_framework.http
def query_incentives(request):
    """HTTP Cloud Function to query incentives based on user responses."""
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        # Get request data
        request_data = request.get_json()
        print(f"Received request data: {request_data}")
        
        if not request_data:
            return (jsonify({'error': 'No data provided'}), 400, headers)
        
        # Build and execute query
        query = db.collection('incentives')
        query = apply_filters(query, request_data)
        print("Query built, streaming results...")
        results = query.stream()
        
        # Process and return results
        processed_results = process_results(results)
        print(f"Successfully processed results: {processed_results}")
        return (jsonify(processed_results), 200, headers)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return (jsonify({'error': str(e)}), 500, headers)
