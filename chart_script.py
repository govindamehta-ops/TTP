import plotly.graph_objects as go
import plotly.express as px
import numpy as np
import pandas as pd

# Use blue and grey color scheme as requested
table_color = '#1FB8CD'  # Blue
header_color = '#5D878F'  # Darker blue-grey
line_color = '#13343B'   # Dark grey

fig = go.Figure()

# Define table data with fields and their types
table_data = {
    'Users': {
        'pos': (0, 2),
        'fields': ['user_id (PK)', 'email', 'password_hash', 'role', 'department_id (FK)', 'created_at']
    },
    'Departments': {
        'pos': (-3, 2),
        'fields': ['department_id (PK)', 'name', 'description', 'manager_id (FK)']
    },
    'Time_Entries': {
        'pos': (-2, 0),
        'fields': ['entry_id (PK)', 'user_id (FK)', 'clock_in', 'clock_out', 'break_duration', 'location']
    },
    'Attendance': {
        'pos': (2, 0),
        'fields': ['attendance_id (PK)', 'user_id (FK)', 'date', 'status', 'work_hours', 'overtime']
    },
    'Leave_Requests': {
        'pos': (3, 1),
        'fields': ['request_id (PK)', 'user_id (FK)', 'leave_type', 'start_date', 'end_date', 'status']
    },
    'Projects': {
        'pos': (-1, 4),
        'fields': ['project_id (PK)', 'name', 'description', 'start_date', 'end_date', 'status']
    },
    'Tasks': {
        'pos': (1, 4),
        'fields': ['task_id (PK)', 'project_id (FK)', 'name', 'assigned_to (FK)', 'estimated_hours', 'status']
    }
}

# Define relationships with clearer notation
relationships = [
    ((-3, 2), (0, 2)),    # Departments to Users
    ((-2, 0), (0, 2)),    # Time_Entries to Users
    ((2, 0), (0, 2)),     # Attendance to Users
    ((3, 1), (0, 2)),     # Leave_Requests to Users
    ((-1, 4), (1, 4)),    # Projects to Tasks
    ((1, 4), (0, 2))      # Tasks to Users
]

# Add relationship lines
for start_pos, end_pos in relationships:
    fig.add_trace(go.Scatter(
        x=[start_pos[0], end_pos[0]],
        y=[start_pos[1], end_pos[1]],
        mode='lines',
        line=dict(color=line_color, width=2),
        showlegend=False,
        hoverinfo='none',
        cliponaxis=False
    ))

# Create table rectangles and text
for table_name, data in table_data.items():
    x_pos, y_pos = data['pos']
    fields = data['fields']
    
    # Table header
    fig.add_trace(go.Scatter(
        x=[x_pos],
        y=[y_pos + 0.3],
        mode='markers+text',
        marker=dict(
            size=60,
            color=header_color,
            symbol='square',
            line=dict(width=2, color=line_color)
        ),
        text=table_name,
        textposition='middle center',
        textfont=dict(size=12, color='white'),
        showlegend=False,
        hoverinfo='none',
        cliponaxis=False
    ))
    
    # Table fields
    for i, field in enumerate(fields):
        field_y = y_pos - 0.1 - (i * 0.15)
        field_text = field[:15] if len(field) > 15 else field  # Truncate to 15 chars
        
        fig.add_trace(go.Scatter(
            x=[x_pos],
            y=[field_y],
            mode='markers+text',
            marker=dict(
                size=50,
                color=table_color,
                symbol='square',
                line=dict(width=1, color=line_color)
            ),
            text=field_text,
            textposition='middle center',
            textfont=dict(size=8, color='black'),
            showlegend=False,
            hovertext=f'{table_name}: {field}',
            hoverinfo='text',
            cliponaxis=False
        ))

# Update layout
fig.update_layout(
    title='Time Tracking DB Schema',
    showlegend=False
)

fig.update_xaxes(
    showgrid=False, 
    zeroline=False, 
    showticklabels=False,
    title='',
    range=[-4, 4]
)

fig.update_yaxes(
    showgrid=False, 
    zeroline=False, 
    showticklabels=False,
    title='',
    range=[-1, 5]
)

# Save the chart
fig.write_image('database_schema.png')