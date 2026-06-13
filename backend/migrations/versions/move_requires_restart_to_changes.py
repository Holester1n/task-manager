"""move requires_restart from segments to changes

Revision ID: a1b2c3d4e5f6
Revises: 018adeb2149d
Create Date: 2026-06-13 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '018adeb2149d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('changes', sa.Column('requires_restart', sa.Boolean(), nullable=False, server_default='false'))
    op.drop_column('segments', 'requires_restart')

def downgrade() -> None:
    op.add_column('segments', sa.Column('requires_restart', sa.Boolean(), nullable=False, server_default='false'))
    op.drop_column('changes', 'requires_restart')